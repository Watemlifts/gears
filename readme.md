# scaffold

simple directory scaffolding for node.

## overview

scaffold is a simple directory scaffolding tool for provisioning common directory structures. The project is based around npm, where users npm install -g the scaffold cli + their own templates (see template directory). By doing so, scaffold will source the template directory, allowing each template to be copied into the current working directory via.

```
$ scaffold [template-name]
```

This project was written for personal use, but is freely available to anyone who finds it useful. The project comes with two typescript templates which i use personally, however users are free to copy, clone, fork reproduce this project at will.

## install

- download, clone or fork this repository.
- add directories to the ```./template``` directory you want scaffolded.
- install scaffold with ```npm install -g```.

## viewing installed templates

To see a list of installed templates type:

```
$ scaffold
```
which results in:
```
usage: 

  scaffold [template-name]

installed:

- typescript-browser-project

- typescript-console-project

```

## installing templates

The following will install the ```typecript-console-project``` template included with this repository.

```
$ mkdir myapp
$ cd myapp
$ scaffold typescript-console-project
```
This will copy the contents of this template into the current working directory.