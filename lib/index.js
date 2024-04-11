const { StorageClient } = require('@supabase/storage-js')
const { getBearerToken, getPathKey, getStorageEndpoint, kbytesToBytes, bytesToHumanReadable } = require('./utils')

/**
 * Strapi File Object
 *
 * @typedef {{
 *    name: string
 *   hash: string
 *   ext: string
 *   mime: string
 *   path: object
 *   width: number
 *   height: number
 *   size: number
 *   url: string
 *   buffer?: string
 *   stream?: ReadStream
 *   getStream: () => {}
 * }} StrapiFile
 */

/**
 * @typedef {{
 *   sizeLimit: number
 * }} ProviderOptions
 */

module.exports = {
  init({ apiUrl, publicUrl, apiKey, bucket, directory = '', cacheControl = '3600' }) {
    const endpoint = getStorageEndpoint(apiUrl)
    const endpoint_public = getStorageEndpoint(publicUrl)

    const storage = new StorageClient(endpoint, {
      apikey: apiKey,
      Authorization: getBearerToken(apiKey),
    })

    /**
     *
     * @param {StrapiFile} file
     */
    const uploadFile = async (file) => {
      const path = getPathKey(file, directory)

      const { error } = await storage.from(bucket).upload(path, file?.stream, {
        contentType: file?.mime,
        duplex: 'half',
        upsert: true,
        cacheControl,
      })

      if (error) {
        throw new Error(error?.message || 'Something went wrong')
      }

      const {
        data: { publicUrl },
      } = await storage.from(bucket).getPublicUrl(path)

      const internalUrl = new URL(publicUrl, endpoint)
      const assetUrl = new URL(`${internalUrl.pathname}${internalUrl.search}${internalUrl.hash}`, endpoint_public);
      file.url = assetUrl.href
    }

    /**
     *
     * @param {StrapiFile} file
     */
    const deleteFile = async (file) => {
      const path = getPathKey(file, directory)

      const { error } = await storage.from(bucket).remove([path])
      if (error) {
        throw new Error(error?.message || 'Something went wrong')
      }
    }

    /**
     *
     * @param {StrapiFile} file
     * @param {ProviderOptions} options
     */
    const checkFileSize = async (file, { sizeLimit }) => {
      if (kbytesToBytes(file.size) > sizeLimit) {
        throw new Error(
          `${file.name} exceeds size limit of ${bytesToHumanReadable(sizeLimit)}.`
        ) 
      }
    }

    return {
      upload: uploadFile,
      uploadStream: uploadFile,
      delete: deleteFile,
      checkFileSize,
    }
  },
}
