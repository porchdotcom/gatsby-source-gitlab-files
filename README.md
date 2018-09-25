# gatsby-source-gitlab-repository-files
Gatsby source plugin to load file metadata from a Gitlab repository

## Usage 
```
npm install @porch/gatsby-source-gitlab-repository-files
```

Add the following to your gatsby-config
```js 
 plugins: [
    {
      resolve: '@porch/gatsby-source-gitlab-repository-files',
      options: {
        folderPath: '../docs', // Folder your want to get all the files in
        gitRepoRoot: '../', // Path from gatsby-config to .git root
        gitlab: {
          domain: 'your-gitlab-domain',
          privateToken: 'your-private-token',
        }
      }
    }
]
```
