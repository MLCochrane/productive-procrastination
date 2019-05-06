# Frontend Boiler

Simple boilerplate for frontend projects allowing you to get up and running quick! Using handlebars, SCSS, an OOP javascript structure and webpack this lets you focus on creating and not worrying about setting up your environment.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Install

Once you've cloned or downloaded the repo you can:

```
npm install
```

Which will install all the necessary dependancies.

Running a development environment is done with:

```
npm run dev
```
### Setting up pages

Without any server-side logic and the handling of routes, [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) is used for the creation of our HTML files.

This will look something like: 

```javascript
    new HtmlWebpackPlugin({
      inject: {},
      template: "src/views/pages/index.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'player/index.html', // specify filename or else will overwrite default index.html
      inject: {},
      template: "src/views/pages/player.hbs"
    }),
```

* Adding a folder when setting the filename for new page templates ensures that the .html extension is not included in the url.

### Handling views

The project also makes use of [Barba](https://github.com/luruke/barba.js) for page transitions. If you would like to make use of this as well, then we need to touch on associating a container and a view (read more [here](http://barbajs.org/views.html)).

Adding a namespace attribute to your page templates like this:

```javascript
{{#> layout/base title='Homepage' namespace="home" }}
  {{#*inline "body"}}
    {{> components/slider }}
  {{/inline}}
{{/layout/base}}

```

Allows you to reference them in a Barba view:

```javascript
import Slider from './js/slider.js';

const HomeView = Barba.BaseView.extend({
    namespace: 'home',
    onEnter() {
        // New container is ready
    },
    onEnterCompleted() {
        const slider = new Slider();
    }
});

HomeView.init();
```

This allows for some more control over state and event binding/unbinding throughout your project.

## Deployment

Building the project files for production is done with: 

```
npm run build
```

This will create a dist folder that is ready to be 

## Built With

* [handlebars](https://handlebarsjs.com/)
* [webpack](https://webpack.js.org/)
* [SCSS](https://sass-lang.com/)
* [Barba](http://barbajs.org/index.html)

## Authors

* **Luke Cochrane** [MLCochrane](https://github.com/MLCochrane/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
