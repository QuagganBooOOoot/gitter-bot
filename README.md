# QuagganBooOOoot

This is a gitter bot for [arenanet/api-cdi](https://gitter.im/arenanet/api-cdi).

# Setup

1. Clone this repository.
2. Create a `config.json` file in the root directory with the following content:
    ```json
    {
      "token": "<GITTER_API_TOKEN>",
      "rooms": [
          "arenanet/api-cdi",
          "..."
      ],
      "forum": {
          "api-development": ["arenanet/api-cdi"]
      }
    }
    ```

3. Run `npm start`.

# License

[MIT](LICENSE.md) © 2017 [darthmaim](https://github.com/darthmaim)
