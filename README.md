# strapi-upload-supabase-provider

Further changed so that it preserves the supabase-configured public url of images.
That way this plugin can be used in a dockerized environment without garbage "supabase-kong:8000" image urls.

<div>
  <img title="Supabase" alt="Supabase logo" src="https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/299/square_480/supabase-logo-icon_1.png" width="120px" height="120px" />
  <img title="Strapi" alt="Strapi logo" src="https://seeklogo.com/images/S/strapi-icon-logo-2E03188067-seeklogo.com.png" width="120px" height="120px" />
</div>


## Resources

- [LICENSE](LICENSE)

## Links

- [Strapi website](https://strapi.io/)
- [Strapi documentation](https://docs.strapi.io)
- [Supabase](https://supabase.com/)
- [Supabase documentation](https://supabase.com/docs)
- [Github repository](https://github.com/jorgeAgoiz/strapi-upload-supabase-provider)

## Installation

```bash
# using yarn
yarn add strapi-upload-supabase-provider

# using npm
npm install strapi-upload-supabase-provider --save
```

## Configuration

- `provider` defines the name of the provider, in this case we must put "strapi-upload-supabase-provider".
- `providerOptions` is passed down during the construction of the provider. (ex: `new StorageClient(config)`).
- `providerOptions.apiUrl` RESTful endpoint to manage your Supabase project.
- `providerOptions.apiKey` API key of your Supabase project(service_role not anon).
- `providerOptions.bucket` name of your Supabase bucket.
- `providerOptions.directory` directory inside the bucket where you want to store your files.
- `sizeLimit` maximum size limit for your files on bytes.

See the [documentation about using a provider](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#using-a-provider) for information on installing and using a provider. To understand how environment variables are used in Strapi, please refer to the [documentation about environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables).

### Provider Configuration

`./config/plugins.js` or `./config/plugins.ts` for TypeScript projects:

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-upload-supabase-provider",
      providerOptions: {
        apiUrl: env("SUPABASE_API_URL"),
        apiKey: env("SUPABASE_API_KEY"),
        bucket: env("SUPABASE_BUCKET_NAME"),
        directory: env("SUPABASE_BUCKET_DIRECTORY"),
      },
      sizeLimit: 1000000000,
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
        checkFileSize: {},
      },
    },
  },
  // ...
});
```

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            env("SUPABASE_API_URL"),
          ],
        },
      },
    },
  },
  // ...
];
```
