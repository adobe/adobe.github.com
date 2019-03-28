[Adobe Open Source](http://adobe.github.com)
=======================

Presenting [Adobe Github Homepage v2.0](http://adobe.github.com), the new central hub for **Adobe Open sources** projects.

Allowing you to **search through Adobe Github repositories**, you can focus on what you are really passionate about.

- Are you a *web developer*? Search the repositories only containing *Javascript* code, because it rocks!
- Love doing *technology watching*? Order by *Popularity*, by *Last Push* or select only the *5 stars (>1k followers)* projects to get the hottest repos!
- Are you a *web designer* and want the perfect code editor? Search *brackets* and get all the repositories related to this awesome project!
- Are you a *researcher*? Check out the project pushed in Open Source by the *Adobe Research* organization!

<h4 align="center"> Adobe + Open Source = ♥ </h4>

That's why we built this project on top of cutting-edge technologies like:

- [AngularJS](http://angularjs.org/),
- [Foundation](http://foundation.zurb.com/),
- [Github Pages](http://pages.github.com/) and [API](http://developer.github.com/v3/),
- [NodeJS](http://nodejs.org)
- [D3](http://d3js.org/)
- and many more!

The [Adobe Creative Cloud](http://www.adobe.com/products/creativecloud.html) is also a great asset for [designing](http://photoshop.com) and [coding](http://brackets.io) purposes.

## Be in touch!

We hope you love this new homepage. Any feedback, ideas or bugfixes are very much welcome. Here is the [Trello board](https://trello.com/b/eLlfvaVe/adobe-github-com) on which you can add your ideas. You can also check out the [wiki page](https://github.com/adobe/adobe.github.com/wiki) to know how to update the page easily. 

All this seems interesting to you? Want to start contributing to the web with Adobe?

<h4 align="center"><a href="http://www.adobe.com/careers.html" target="_blank">Join the team!</a></h4>

## Architecture

Hummm... want to learn more about how all this is structured? A good sketch is better than a long speech, so here is a little schema:

<p align="center"> <img src="https://raw.github.com/adobe/adobe.github.com/master/img/schema_adobe_open_source.png"  alt="Adobe Open Source schema" /></p>

The information is pulled directly from the [Github API](http://developer.github.com/v3/) and aggregated by a [NodeJS](http://nodejs.org) server (its code source is available [in this repository](https://github.com/adobe/server.adobe.github.com)). It is available through an simple REST API, thanks to [restify](http://mcavage.me/node-restify/).

[AngularJS](http://angularjs.org/) then makes a unique API call to the server and inject the data on your browser, based on the [Foundation](http://foundation.zurb.com/) CSS framework and using [dc.js](http://nickqizhu.github.io/dc.js/) for the graphs. The filtering engine for the repositories was built on top of Angular.

## Deploying Locally

Install local web server globally

```
npm i -g local-web-server
```

Run `ws` command in your terminal in the root of this project to lauch a local web server showing the site

Site should be running on `http://localhost:8000/`	
