const unirest = require("unirest");
const bingSearchCredenciais = require("../credenciais/bing-search.json");
const imageDownloader = require("image-downloader");
const fs = require("fs");


async function robo() { 
    console.log('Inicio do robo de imagens do BING');
    let imagesUrl = [];
    let totalResultados = 1000;
    const content = {
        sentencas: [
            {
                texto: "gato_branco",
                termoBusca: `"white cat"`,
                pasta: "solid_color",
            },
            {
                texto: "gato_preto",
                termoBusca: `"black cat"`,
                pasta: "solid_color",
            },
            {
                texto: "Tortoiseshell",
                termoBusca: `"Tortoiseshell cat"`,
                pasta: "tortoiseshell",
            }
        ]
    }
    
    await retornaLinksTodasSentencas(content);
    await baixarTodasImagens(content);
    
    async function retornaLinksTodasSentencas(content) {
        return new Promise(async (resolve) => {
            for (const sentenca of content.sentencas) {
                sentenca.imagens = await retornaTodasUrlsImagens(sentenca.termoBusca);
            }
            resolve();
        });
    }

    async function retornaTodasUrlsImagens(termoBusca) {
        return new Promise(async (resolve, reject) => {
            try {
                for (let i = 0; i < totalResultados; i = i + 150) {
                    await pesquisaBingERetornaLinksImagens(termoBusca, i);
                }
                console.log("imagesUrl: ", imagesUrl);
                resolve(imagesUrl);

                // return imagesUrl;
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }
    async function pesquisaBingERetornaLinksImagens(termoBusca,cursor) {
        //Retorna uma Promise com a execução do unirest
        return new Promise(async (resolve, reject) => {
            //tenta executar o código se der erro vai para o catch
            try {
                //instância o unirest com o método GET e com a url do serviço do Bing
                let req = unirest(
                    "GET",
                    "https://api.bing.microsoft.com/v7.0/images/search"
                );
                //passa o termo de busca, o numero de resultados (150 é o máx), e o tipo de busca
                req.query({
                    q: termoBusca,
                    count: 150,
                    imageType: "Photo",
                    offset: cursor
                });
                //passa a apikey pelo cabeçalho                
                req.headers({
                    "Ocp-Apim-Subscription-Key": bingSearchCredenciais.apiKey,
                });
                //define a função que será executada ao receber a resposta da API
                await req.end(function (res) {
                    //verifica se deu erro e retorna o mesmo
                    if (res.error) throw new Error(res.error);
                    //verifica se o total de resultados é maior que o número de resultados da busca
                    if (totalResultados > res.body.totalEstimatedMatches) {
                        totalResultados = res.body.totalEstimatedMatches;
                        console.log("Total estimado de imagens: ", totalResultados);
                    }
                    //pega todas as urls das imagens que viera da busca
                    imagesUrl = imagesUrl.concat(
                        res.body.value.map((item) => {
                            return item.contentUrl;
                        })
                    );
                    
                    console.log("imagesUrl: ", imagesUrl);

                    //resolve a Promise retorna as URLs das imagens
                    resolve(imagesUrl);
                });
                //se der erro no código vem aqui e rejeita a Promise e retorna o erro
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }

    async function baixarTodasImagens(content) {
        //cria um array para contabilizar as imagens jque foram baixadas
        content.imagensBaixadas = [];
        //Fazemos um loop com todas as sentenças
        for (
            let sentenceIndex = 0;
            sentenceIndex < content.sentencas.length;
            sentenceIndex++
        ) {
            //pega todas as imagens de uma sentença
            const imagens = content.sentencas[sentenceIndex].imagens;
            //Fazemos um loop com todas as imagens
            for (let imageIndex = 0; imageIndex < imagens.length; imageIndex++) {
                //pega a URL da imagem
                const imageUrl = imagens[imageIndex];
                //verifica se a imagem já foi baixada
                try {                                 
                    if (content.imagensBaixadas.includes(imageUrl)) {
                        throw new Error("Imagem ja foi baixada");
                    }
                    //faz o download da imagem utilizando o texto da sentença e o indice para montar o nome do arquivo
                    await download(
                        imageUrl,
                        imageIndex + "-" + content.sentencas[sentenceIndex].texto + "-bing.png",
                        content.sentencas[sentenceIndex].pasta
                    );
                    //guarda a imagem biaxada no array de imagens baixadas
                    content.imagensBaixadas.push(imageUrl);
                    console.log(
                        "[" +
                        sentenceIndex +
                        "] [" +
                        imageIndex +
                        "]> baixou imagem com sucesso: " +
                        imageUrl
                    );
                } catch (error) {
                    console.log(
                        "[" +
                        sentenceIndex +
                        "] [" +
                        imageIndex +
                        "]> Erro ao baixar imagem: " +
                        imageUrl,
                        error
                    );
                }
            }
        }
    }

    async function download(url, fileName, pasta) {
        const dir = "./content/" + pasta;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return imageDownloader.image({
            url,
            url,
            dest: "./content/" + pasta + "/" + fileName,
        });
    }    
}

module.exports = robo;