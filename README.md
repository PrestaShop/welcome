# OnBoarding

## About

This module help the user to create his first product and discover main functionnalities to create his shop.

## How to customize the OnBoarding

Every steps are stored on the config/steps.yml file.

On this file you will have groups containing the steps. Just follow this micro documentation to create / modify the steps:

```yml
groups:                            # Only needed once

 - title: { loc: group1.title }    # The title of the group, shown on the footer.
   steps:                          # The steps list of this group.

     # Basic configuration for each step:
     - type: popup                 # The type of the step, can be 'popup' or 'tooltip'.
       title: { loc:group1.title } # The title of the step, shown on the footer.
       text:  { loc:group1.title } # The content of the step, displayed on the popup or the tooltip
       page:  'product/new'        # The page where the step is placed
       # OR : An array of pages, when the Onboarding automaticaly move to the page, the first one
       # will be selected :
       page:  ['product/new', 'product/form'] 

       # Configuration only for type = 'tooltip':
       selector: '#description' # The jQuery selector where the toolip will be located
       position: top            # The position of the tooltip around the object, can be :
                                # 'left', 'right', 'top' or 'bottom'
                                
       # Optionnal parameters:
       action:                 # Instead of just move to the next step, an action can be performed:
         selector: '#myButton' # jQuery selector where the action will be performed
         action:   'click'     # Action to perform
       options: [savepoint]    # A list of options for this step, the options can be :
                               #  - 'savepoint': If the user resume after paused, the first save
                               #      will be the last savepoint
                               #  - 'hideFooter': Hide the footer for the current step
```

Just a word for the localization:

The localized entries are on the _config/localization_ folder. Each entries have a key. To use one of this entry, just use ```{ loc: key.subkey }``` instead of a string. (For the titles and contents).

If you want complex content, just create a TWIG template on the _views/contents_ and use ```{ content: templateName }``` instead of a string.

## How to build the OnBoarding module

The assets can already be found in this repo, but if you need to update the files, you will have to run webpack again.
This module uses Webpack 4, so make sure you have all packages and the cli tool installed first:
```shell
$ npm i
$ npm i -g webpack-cli 
```

This should be enough to get started in dev mode and watch for changes:
```shell
$ npm run watch
```

for production use the following command and set the `NODE_ENV` environment variable:
```shell
$ npm run build
```

Manual development mode:
```shell
$ webpack --config webpack.dev.js
```

Manual production mode:
```shell
$ webpack --config webpack.prod.js
```
