const express = require('express')
const xss = require('xss')
const path = require('path')
const ArticlesService = require('./articles-service')

const articlesRouter = express.Router()
const jsonParser = express.json()

let sanitize = article => ({
    id: article.id,
    title: xss(article.title),
    style: article.style,
    content: xss(article.content),
    date_published: article.date_published
})

articlesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        ArticlesService.getAllArticles(knexInstance)
            .then(articles => {
                res.json(articles.map(sanitize))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, style, content } = req.body;
        const newArticle = { title, style, content }

        for (const [key, value] of Object.entries(newArticle)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ArticlesService.insertArticle(
            req.app.get('db'),
            newArticle
        )

            .then(article => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${article.id}`))
                    .json(sanitize(article))
            })
            .catch(next)
    })


articlesRouter
    .route('/:article_id')
    .all((req, res, next) => {
        ArticlesService.getById(
            req.app.get('db'),
            req.params.article_id
        )
            .then(article => {
                if (!article) {
                    return res.status(404).json({
                        error: { message: `Article does not exist` }
                    })
                }
                res.article = article;
                next()
            })
            .catch(next)

    })
    .get((req, res, next) => {
        res.json({
            id: res.article.id,
            style: res.article.style,
            title: xss(res.article.title), // sanitize title
            content: xss(res.article.content), // sanitize content
            date_published: res.article.date_published,
        })
    })
    .delete((req, res, next) => {
        ArticlesService.deleteArticle(req.app.get('db'),
            req.params.article_id)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, content, style } = req.body;
        const articleToUpdate = { title, content, style }

        const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {message: `Request body must contain either 'title', 'style' or 'content'`}
            })
        }
        
        ArticlesService.updateArticle(
            req.app.get('db'),
            req.params.article_id,
            articleToUpdate
        )

            .then(numRowsAffected => {
                res.status(204).end()
            })

            .catch(next)
    })

module.exports = articlesRouter