# create-banner-studio [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)](https://github.com/aptas/create-banner-studio)

Create banners with no build configuration.

If something doesn’t work, please [file an issue](https://github.com/aptas/create-banner-studio/issues/new).

## Quick Overview

```sh
npx create-banner-studio my-banner
cd my-banner
npm start
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.<br>
When you’re ready to build, create your bundles with `npm run build`.

### Get Started Immediately

You **don’t** need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.

Just create a project, and you’re good to go.

## Creating the studio

**You’ll need to have Node 8.10.0 or later on your local development machine**

To create a new studio, you may choose one of the following methods:

### npx

```sh
npx create-banner-studio my-banner
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

### npm

```sh
npm init banner-studio my-banner
```

_`npm init <initializer>` is available in npm 6+_

### Yarn

```sh
yarn create banner-studio my-banner
```

_`yarn create` is available in Yarn 0.25+_

It will create a directory called `my-banner` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-banner
├── node_modules
├── src
│   ├── [width]x[height]_[name] (example banner)
│   │   ├── content.html
│   │   ├── entry.js
│   │   ├── scripts.js
│   │   └── styles.css
│   └── shared
│       ├── media
│       │   └── (shared media assets)
│       └── styles
│           └── (shared styles)
├── .editorconfig
├── .eslintrc
├── .gitignore
├── .prettierrc
├── formula.yml
├── package.json
└── README.md
```

No configuration or complicated folder structures, just the files you need to build your app.<br>
Once the installation is done, you can open your studio folder:

```sh
cd my-banner
```

## The formula.yml file
This is the heart and brains of the banner studio, it contains all necessary information about your banners and providers etc.

Here's an example of what it might look like.

```yaml
# This is the list of banners to be generated/built.
banners:
  # Each banner must have a unique name. When the banners are generated/built a folder will be created using the [width]x[height]_[name] pattern.
  - name: master
    # Dimensions of the banner.
    dimensions:
      width: 980
      height: 300
      # If a banner is responsive, the width will always be 100%.
      responsive: false
    # The provider option determines how clicktags etc should be structured in the built HTML. The studio automatically adds these for you in the build step.
    provider: adform
    # The sizeLimit is optional and only used to display a helpful message after each build. Warning you if any banner should exceed the limit.
    sizeLimit: 150
    # Specifies if scripts/styles should be inlined into the HTML or included as separate files.
    inline:
      css: true
      js: true
    # This option provides an easy way to specify third-party libraries. A few can be included by just specifying an alias, such as "gsap", "jQuery", "seenthis" and "three". But if the studio doesn't recognize an alias it will default to using it directly in the src attribute. Which means you can specify third-party libraries using cdn urls directly.
    thirdParty:
      - gsap
    # The minify option tells the build script what parts of the code should be minimized when building.
    minify:
      html: false
      css: true
      js: true

# All options (except for dimensions) can be set globally for all banners if specified as below. Individuall banner settings will overwrite the global settings.
options:
  minify:
      html: true
      css: true
      js: true

```

---

Inside the newly created studio, you can run some built-in commands:

### `npm run create` or `yarn create`

Starts an interactive flow of creating a new banner within the set. The output is then added to the formula and a new banner is generated.<br>

But you can also edit the formula.yml directly.

### `npm run generate` or `yarn generate`

Reads the formula and scaffolds folders/files if new banners have been added to the formula but haven't been created yet.<br>

### `npm start` or `yarn start`

Runs the studio in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The banners will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.

### `npm run build` or `yarn build`

Builds the banners for production to the `dist` folder.<br>
This command automatically bundles the banners according to whatever you've specified in formula.yml. Including provider specific scripts, manifest files etc.

## License

MIT © [TRY/Apt](https://try.no/try-apt)
