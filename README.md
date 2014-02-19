[Adobe Open Source](http://adobe.github.com)
=======================

Presenting [Adobe Github Homepage v2.0](http://adobe.github.com), the new central hub for **Adobe Open sources** projects.

Allowing you to **search through Adobe Github repositories**, you can focus on what you are really passionated about.

- You are a *web developer*? Search the repositories only containing *Javascript* code, because it rocks!
- You love doing *technology watching*? Order by *Popularity*, by *Last Push* or select only the *5 stars (>1k followers)* projects to get the hotest repos!
- You are a *web designer* and want the perfect code editor? Search *brackets* and get all the repositories related to this awesome project!
- You are a *researcher*? Check out the project pushed in Open Source by the *Adobe Research* organisation!

<h4 align="center"> Adobe + Open Source = ♥ </h4>

That's why we built this project on top of cutting-edge technologies like:

- [AngularJS](http://angularjs.org/),
- [Foundation](http://foundation.zurb.com/),
- [Github Pages](http://pages.github.com/) and [API](http://developer.github.com/v3/),
- [NodeJS](nodejs.org)
- [D3](http://d3js.org/)
- and many more!

The [Adobe Creative Cloud](http://www.adobe.com/products/creativecloud.html) was also a great asset for [designing](photoshop.com) and [coding](brackets.io) purposes.

## Be in touch!

We hope you love this new homepage. Any feedback, ideas or bugfixs is very welcome. Here is the [Trello board](https://trello.com/b/eLlfvaVe/adobe-github-com) on which you can add you ideas. You can also check out the [wiki page](https://github.com/adobe/adobe.github.com/wiki) to know how to update the page easily. 

All this seems interesting to you? You want to contribute to the web with Adobe?

<h4 align="center"><a href="http://www.adobe.com/careers.html" target="_blank">Join the team!</a></h4>

## Architecture

Hummm... you want to learn more about how all this is structured? A good sketch is better than a long speech, so here is a little schema:

<p align="center"> <img src="https://raw2.github.com/adobe/adobe.github.com/master/img/schema_adobe_open_source.png"  alt="Adobe Open Source schema" /></p>

The information is pulled directly from the [Github API](http://developer.github.com/v3/) and aggregated by a [NodeJS](nodejs.org) server (its code source is available [in this repository](https://github.com/kimchouard/server.adobe.github.com)). It is available through an simple REST API, thanks to [restify](mcavage.me/node-restify/).

[AngularJS](http://angularjs.org/) then makes a unique API call to the server and inject the data on your browser, based on the [Foundation](http://foundation.zurb.com/) CSS framework and using [dc.js](nickqizhu.github.io/dc.js/) for the graphs. The filtering engine for the repositories was built on top of Angular.