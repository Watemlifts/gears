# gears

simple directory scaffolding for node.

## overview

gears is a simple directory scaffolding tool for provisioning common directory structures. gears will source the contents of the ```./templates``` directory, and simply copies the templates contents into the current working directory with the following.

```
$ gears [template-name]
```

This project was written for personal use, but is freely available to anyone who finds it useful. The project comes with some existing templates which i use personally, however users are free to copy, clone, fork reproduce this project at will.

## install

- download, clone or fork this repository.
- install gears as a desired location with ```npm install -g```.
- add / remove directories to the ```./templates``` directory you want scaffolded.
- run ```$ gears [template-name]``` to copy template into current working directory.

## viewing installed templates

To see a list of installed templates type:

```
$ gears
```
which results in:
```
usage: 

  gears [template-name]

installed:

- browser-library-project

- node-express-project

- node-library-project

- node-websocket-project
```

## installing templates

Once gears is installed following will install the ```node-express-project``` template included with this repository.

```
$ mkdir myapp
$ cd myapp
$ gears node-express-project
```