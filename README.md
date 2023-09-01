# Project Name

## Description

A brief description of the project goes here.

## Installation

For executing prisma scripts based on `.env.(development/production)` file

```bash
npm i dotenv-cli -g
```

For Windows error: `NODE_ENV is not recognized as an internal or external command, operable program or batch file`

```bash
npm install -g win-node-env
```

## Usage

### Development

To generate prisma schema in the development environment, use the following command:

```bash
npm run generate-dev
```

To start the development server, run the following command:

```bash
npm run start-dev
```

### Production

To generate prisma schema in the production environment, use the following command:

```bash
npm run generate-prod
```

To start the production server, run the following command:

```bash
npm run start-prod
```

## Prisma Table UI

To access the Prisma table UI, use the following commands:

For the development environment:

```bash
npm run studio-dev
```

For the production environment:

```bash
npm run studio-prod
```

## License

This project is licensed under the [MIT License](LICENSE).
