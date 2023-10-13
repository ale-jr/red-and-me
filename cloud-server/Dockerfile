# Stage 1: Build
FROM node:latest AS build

# Criação do diretório de trabalho no contêiner
WORKDIR /app

# Copiando os arquivos de configuração e dependências
COPY package.json package-lock.json ./


# Instalando as dependências do projeto
RUN npm install

# Stage 2: Run
FROM node:latest AS run

# Criação do diretório de trabalho no contêiner
WORKDIR /app

# Copiando apenas os arquivos necessários do stage de build
COPY . .
COPY --from=build /app .

# Expondo a porta 5000
EXPOSE 5000

# Iniciando o script
CMD ["node", "src/index.js"]
