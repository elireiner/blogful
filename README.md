# Blogful-api

This api provides basic HTTP methods for handling articles and comments.

## Database handling

Create database `createdb -U dunder_mifflin blogful`

Create table `npm run migrate -- 1`

Create 'style' type `npm run migrate -- 2`

Seed the table `psql -U dunder_mifflin -d blogful -f ./seeds/seed.blogful_articles.sql`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Forking and Deploying

Feel free to fork this project: 

in GitHub you'll seethe fork button at the top right corner.

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.