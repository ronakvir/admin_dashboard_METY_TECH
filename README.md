# Admin Dashboard 

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](code_of_conduct.md)
[![License: MIT](https://img.shields.io/github/license/vintasoftware/django-react-boilerplate.svg)](LICENSE.txt)

## About

A [Django](https://www.djangoproject.com/) project boilerplate/template with a multitude of state-of-the-art libraries and tools. If pairing Django with React is a possibility for your project or spinoff, this is the best solution available. Save time with tools like:

-   [React](https://react.dev/), for building interactive UIs
-   [TypeScript](https://www.typescriptlang.org/), for static type checking
-   [Poetry](https://python-poetry.org/), for managing the environment and its dependencies
-   [django-js-reverse](https://github.com/vintasoftware/django-js-reverse), for generating URLs on JS
-   [React Bootstrap](https://react-bootstrap.github.io/), for responsive styling
-   [Webpack](https://webpack.js.org/), for bundling static assets
-   [Celery](https://docs.celeryq.dev/en/stable/), for background worker tasks
-   [WhiteNoise](https://whitenoise.readthedocs.io/en/stable/) with [brotlipy](https://github.com/python-hyper/brotlicffi), for efficient static files serving
-   [ruff](https://github.com/astral-sh/ruff) and [ESLint](https://eslint.org/) with [pre-commit](https://pre-commit.com/) for automated quality assurance (does not replace proper testing!)

For continuous integration, a [Github Action](https://github.com/features/actions) configuration `.github/workflows/main.yml` is included.

Also, includes a Render.com `render.yaml` and a working Django `production.py` settings, enabling easy deployments with ['Deploy to Render' button](https://render.com/docs/deploy-to-render). The `render.yaml` includes the following:

-   PostgreSQL, for DB
-   Redis, for Celery

## Features Catalogue

### Frontend

-   `react` for building interactive UIs
-   `react-dom` for rendering the UI
-   `react-router` for page navigation
-   `webpack` for bundling static assets
-   `webpack-bundle-tracker` for providing the bundled assets to Django
-   Styling
    -   `bootstrap` for providing responsive stylesheets
    -   `react-bootstrap` for providing components built on top of Bootstrap CSS without using plugins
    -   `sass` for providing compatibility with SCSS files
-   State management and backend integration
    -   `axios` for performing asynchronous calls
    -   `cookie` for easy integration with Django using the `csrftoken` cookie
    -   `openapi-ts` for generating TypeScript client API code from the backend OpenAPI schema
    -   `history` for providing browser history to Connected React Router
-   Utilities
    -   `lodash` for general utility functions
    -   `classnames` for easy working with complex CSS class names on components
    -   `react-refresh` for improving QoL while developing through automatic browser refreshing

### Backend

-   `django` for building backend logic using Python
-   `djangorestframework` for building a REST API on top of Django
-   `drf-spectacular` for generating an OpenAPI schema for the Django REST API
-   `django-webpack-loader` for rendering the bundled frontend assets
-   `django-js-reverse` for easy handling of Django URLs on JS
-   `django-upgrade` for automatically upgrading Django code to the target version on pre-commit
-   `django-guid` for adding a unique correlation ID to log messages from Django requests
-   `psycopg` for using PostgreSQL database
-   `sentry-sdk` for error monitoring
-   `python-decouple` for reading environment variables on settings files
-   `celery` for background worker tasks
-   `django-csp` for setting the draft security HTTP header Content-Security-Policy
-   `django-permissions-policy` for setting the draft security HTTP header Permissions-Policy
-   `django-defender` for blocking brute force attacks against login
-   `whitenoise` and `brotlipy` for serving static assets



## Project bootstrap


-   [ ] Go into project's root directory: `cd admin_dashboard`
-   [ ] Add an email address to the `ADMINS` settings variable in `admin_dashboard/backend/admin_dashboard/settings/base.py`
-   [ ] Change the `SERVER_EMAIL` to the email address used to send e-mails in `admin_dashboard/backend/admin_dashboard/settings/production.py`



## Running

### Tools

-   Setup [editorconfig](http://editorconfig.org/), [ruff](https://github.com/astral-sh/ruff) and [ESLint](http://eslint.org/) in the text editor you will use to develop.

### Setup

-   Do the following:
    -   Create a git-untracked `local.py` settings file:
        `cp backend/admin_dashboard/settings/local.py.example backend/admin_dashboard/settings/local.py`
    -   Create a git-untracked `.env.example` file:
        `cp backend/.env.example backend/.env`


-   Open the `backend/.env` file on a text editor and uncomment the line `DATABASE_URL=DATABASE_URL=mysql-connector://admin_dashboard:password@db:3306/admin_dashboard`
-   Open a new command line window and go to the project's directory
-   Run the initial setup:
    `make docker_setup`
-   Create the migrations for `users` app:
    `make docker_makemigrations`
-   Run the migrations:
    `make docker_migrate`
-   Run the project:
    `make docker_up`
-   Access `http://localhost:8000` on your browser and the project should be running there
    -   When you run `make docker_up`, some containers are spinned up (frontend, backend, database, etc) and each one will be running on a different port
    -   The container with the React app uses port 3000. However, if you try accessing it on your browser, the app won't appear there and you'll probably see a blank page with the "Cannot GET /" error
    -   This happens because the container responsible for displaying the whole application is the Django app one (running on port 8000). The frontend container is responsible for providing a bundle with its assets for [django-webpack-loader](https://github.com/django-webpack/django-webpack-loader) to consume and render them on a Django template
-   To access the logs for each service, run:
    `make docker_logs <service name>` (either `backend`, `frontend`, etc)
-   To stop the project, run:
    `make docker_down`

#### Adding new dependencies

-   Open a new command line window and go to the project's directory
-   Update the dependencies management files by performing any number of the following steps:
    -   To add a new **frontend** dependency, run `npm install <package name> --save`
        > The above command will update your `package.json`, but won't make the change effective inside the container yet
    -   To add a new **backend** dependency, run `docker compose run --rm backend bash` to open an interactive shell and then run `poetry add {dependency}` to add the dependency. If the dependency should be only available for development user append `-G dev` to the command.
    -   After updating the desired file(s), run `make docker_update_dependencies` to update the containers with the new dependencies
        > The above command will stop and re-build the containers in order to make the new dependencies effective



### Testing

`make test`

Will run django tests using `--keepdb` and `--parallel`. You may pass a path to the desired test module in the make command. E.g.:

`make test someapp.tests.test_views`

### Adding new pypi libs

To add a new **backend** dependency, run `poetry add {dependency}`. If the dependency should be only available for development user append `-G dev` to the command.

### API Schema and Client generation

We use the [`DRF-Spectacular`](https://drf-spectacular.readthedocs.io/en/latest/readme.html) tool to generate an OpenAPI schema from our Django Rest Framework API. The OpenAPI schema serves as the backbone for generating client code, creating comprehensive API documentation, and more.

The API documentation pages are accessible at `http://localhost:8000/api/schema/swagger-ui/` or `http://localhost:8000/api/schema/redoc/`.

> [!IMPORTANT]
> Anytime a view is created, updated, or removed, the schema must be updated to reflect the changes. Failing to do so can lead to outdated client code or documentation.
>
> To update the schema, run:
> - `make docker_backend_update_schema`

We use the [`openapi-ts`](https://heyapi.vercel.app/openapi-ts/get-started.html) tool to generate TypeScript client code from the OpenAPI schema. The generated client code is used to interact with the API in a type-safe manner.

> [!IMPORTANT]
> Anytime the API schema is updated, the client code must be regenerated to reflect the changes. Failing to do so can lead to type errors in the client code.
>
> To update the client code, run:
> - `make docker_frontend_update_api`

> [!NOTE]
> If `pre-commit` is properly enabled, it will automatically update both schema and client before each commit whenever necessary.

## Github Actions

To enable Continuous Integration through Github Actions, we provide a `proj_main.yml` file. To connect it to Github you need to rename it to `main.yml` and move it to the `.github/workflows/` directory.

You can do it with the following commands:

```bash
mkdir -p .github/workflows
mv proj_main.yml .github/workflows/main.yml
```

## Production Deployment

### Setup

This project comes with an `render.yaml` file, which can be used to create an app on Render.com from a GitHub repository.

Before deploying, please make sure you've generated an up-to-date `poetry.lock` file containing the Python dependencies. This is necessary even if you've used Docker for local runs. Do so by following [these instructions](#setup-the-backend-app).

After setting up the project, you can init a repository and push it on GitHub. If your repository is public, you can use the following button:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

If you are in a private repository, access the following link replacing `$YOUR_REPOSITORY_URL$` with your repository link.

-   `https://render.com/deploy?repo=$YOUR_REPOSITORY_URL$`

Keep reading to learn how to configure the prompted environment variables.

#### `ALLOWED_HOSTS`

Chances are your project name isn't unique in Render, and you'll get a randomized suffix as your full app URL like: `https://admin_dashboard-a1b2.onrender.com`.

But this will only happen after the first deploy, so you are not able to properly fill `ALLOWED_HOSTS` yet. Simply set it to `*` then fix it later to something like `admin_dashboard-a1b2.onrender.com` and your domain name like `example.org`.

#### `ENABLE_DJANGO_COLLECTSTATIC`

Default is 1, meaning the build script will run collectstatic during deploys.

#### `AUTO_MIGRATE`

Default is 1, meaning the build script will run collectstatic during deploys.

### Build script

By default, the project will always run the `render_build.sh` script during deployments. This script does the following:

1.  Build the frontend
2.  Build the backend
3.  Run Django checks
4.  Run `collectstatic`
5.  Run Django migrations
6.  Push frontend source maps to Sentry

### Celery

As there aren't free plans for Workers in Render.com, the configuration for Celery workers/beat will be commented by default in the `render.yaml`. This means celery won't be available by default.

Uncommenting the worker configuration lines on `render.yaml` will imply in costs.

### SendGrid

To enable sending emails from your application you'll need to have a valid SendGrid account and also a valid verified sender identity. After finishing the validation process you'll be able to generate the API credentials and define the `SENDGRID_USERNAME` and `SENDGRID_PASSWORD` environment variables on Render.com.

These variables are required for your application to work on Render.com since it's pre-configured to automatically email admins when the application is unable to handle errors gracefully.

### Media storage

Media files integration with S3 or similar is not supported yet. Please feel free to contribute!

### Sentry

[Sentry](https://sentry.io) is already set up on the project. For production, add `SENTRY_DSN` environment variable on Render.com, with your Sentry DSN as the value.

You can test your Sentry configuration by deploying the boilerplate with the sample page and clicking on the corresponding button.

### Sentry source maps for JS files

The `render_build.sh` script has a step to push Javascript source maps to Sentry, however some environment variables need to be set on Render.com.

The environment variables that need to be set are:

-   `SENTRY_ORG` - Name of the Sentry Organization that owns your Sentry Project.
-   `SENTRY_PROJECT_NAME` - Name of the Sentry Project.
-   `SENTRY_API_KEY` - Sentry API key that needs to be generated on Sentry. [You can find or create authentication tokens within Sentry](https://sentry.io/api/).

After enabling dyno metadata and setting the environment variables, your next Render.com Deploys will create a release on Sentry where the release name is the commit SHA, and it will push the source maps to it.

## Linting

-   At pre-commit time (see below)
-   Manually with `poetry run ruff` and `npm run lint` on project root.
-   During development with an editor compatible with ruff and ESLint.

## Opinionated Settings

Some settings defaults were decided based on Vinta's experiences. Here's the rationale behind them:

### `DATABASES["default"]["ATOMIC_REQUESTS"] = True`

- Using atomic requests in production prevents several database consistency issues. Check [Django docs for more details](https://docs.djangoproject.com/en/5.0/topics/db/transactions/#tying-transactions-to-http-requests).

- **Important:** When you are queueing a new Celery task directly from a Django view, particularly with little or no delay/ETA, it is essential to use `transaction.on_commit(lambda: my_task.delay())`. This ensures that the task is only queued after the associated database transaction has been successfully committed.
  - If `transaction.on_commit` is not utilized, or if a significant delay is not set, you risk encountering race conditions. In such scenarios, the Celery task might execute before the completion of the request's transaction. This can lead to inconsistencies and unexpected behavior, as the task might operate on a database state that does not yet reflect the changes made in the transaction. Read more about this problem on [this article](https://www.vinta.com.br/blog/database-concurrency-in-django-the-right-way).

### `CELERY_TASK_ACKS_LATE = True`

- We believe Celery tasks should be idempotent. So for us it's safe to set `CELERY_TASK_ACKS_LATE = True` to ensure tasks will be re-queued after a worker failure. Check Celery docs on ["Should I use retry or acks_late?"](https://docs.celeryq.dev/en/stable/faq.html#faq-acks-late-vs-retry) for more info.

### Django-CSP

Django-CSP helps implementing Content Security Policy (CSP) in Django projects to mitigate cross-site scripting (XSS) attacks by declaring which dynamic resources are allowed to load.

In this project, we have defined several CSP settings that define the sources from which different types of resources can be loaded. If you need to load external images, fonts, or other resources, you will need to add the sources to the corresponding CSP settings. For example:
- To load scripts from an external source, such as https://browser.sentry-cdn.com, you would add this source to `CSP_SCRIPT_SRC`.
- To load images from an external source, such as https://example.com, you would add this source to `CSP_IMG_SRC`.

Please note that you should only add trusted sources to these settings to maintain the security of your site. For more details, please refer to the [Django-CSP documentation](https://django-csp.readthedocs.io/en/latest/).

## Contributing

If you wish to contribute to this project, please first discuss the change you wish to make via an [issue](https://github.com/vintasoftware/django-react-boilerplate/issues).

Check our [contributing guide](https://github.com/vintasoftware/django-react-boilerplate/blob/main/CONTRIBUTING.md) to learn more about our development process and how you can test your changes to the boilerplate.

## Commercial Support

[![alt text](https://avatars2.githubusercontent.com/u/5529080?s=80&v=4 "Vinta Logo")](https://www.vinta.com.br/)

This project is maintained by [Vinta Software](https://www.vinta.com.br/) and is used in products of Vinta's clients. We are always looking for exciting work! If you need any commercial support, feel free to get in touch: contact@vinta.com.br
