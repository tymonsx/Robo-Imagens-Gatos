const imageDownloader = require("image-downloader");
const pixabayApi = require("pixabay-api");
const pixabaySearchCredenciais = require("../credenciais/pixabay-search.json");
const fs = require("fs");
const { exit } = require("process");


async function robo() {
    console.log('Inicio do robo de imagens do Pixabay');
    let imagesUrl = [];
    // Define o numero de resultados por página
    let imgPagina = 200 
    //Total de Resultados da busca (por padrão espera-se 500)
    let totalResultados = 500
  
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
                texto: "gato_cinza",
                termoBusca: `"grey cat"`,
                pasta: "solid_color",
            },
            {
                texto: "Tortoiseshell",
                termoBusca: `"Tortoiseshell cat"`,
                pasta: "tortoiseshell",
            },      
            {
                texto: "calico",
                termoBusca: `Calico Cat`,
                pasta: "calico",
            },
            {
                texto: "Tabby_Mackerel",
                termoBusca: `Tabby Mackerel`,
                pasta: "tabby_mackerel",
            },      
            {
                texto: "Blotched_Tabby",
                termoBusca: `Blotched Tabby`,
                pasta: "classic_Tabby",
            },      
            {
                texto: "Classic_Tabby",
                termoBusca: `Classic Tabby`,
                pasta: "classic_Tabby",
            },
            {
                texto: "Spotted_Tabby",
                termoBusca: `Spotted Tabby Cat`,
                pasta: "Spotted_Tabby",
            },
            {
                texto: "Bicolor",
                termoBusca: `Bicolor Cat`,
                pasta: "Bicolor",
            },     
            {
                texto: "Colorpoint",
                termoBusca: `Colorpoint Cat`,
                pasta: "Colorpoint",
            },      
            {
                texto: "Hairless",
                termoBusca: `Hairless Cat`,
                pasta: "Hairless",
            },
        ],
    };

    await retornaLinksTodasSentencas(content);
    await baixarTodasImagens(content);
    
    async function retornaLinksTodasSentencas(content) {
        return new Promise(async (resolve) => {
            //busca as imagens para cada sentença 
            for (const sentenca of content.sentencas) {
                //reseta o total de resultados antes de uma nova busca
                totalResultados = 500
                console.log("Buncando por: ",sentenca.termoBusca)
                sentenca.imagens = await retornaTodasUrlsImagens(sentenca.termoBusca);
                console.log("Total de Resultados: ", totalResultados);
            }
            resolve();
        });
    }

    async function retornaTodasUrlsImagens(termoBusca) {
        return new Promise(async (resolve, reject) => {
            try {
                //Faz uma busca para cada página de busca
                for (let i = 1; i <= Math.ceil(totalResultados/imgPagina); i ++) {
                    await pesquisaPixabayERetornaLinksImagens(termoBusca, i);
                }
                
                resolve(imagesUrl);                
            } catch (error) {
                //caso algum erro ocorra será apresentado o erro
                console.log("erro em retornaTodasUrlsImagens: ", error);
                reject(error);
            }
        });
    }

    async function pesquisaPixabayERetornaLinksImagens(termoBusca, pagina) {
        try {
           //Executa a busca de imagens no pixabay
            await pixabayApi.searchImages(pixabaySearchCredenciais.apiKey, termoBusca, {per_page: imgPagina, page:pagina}).then(
                //função que será executada com o retorno da busca de imagens
                function(response) {
                    //atualiza o total de resultados
                    if (totalResultados > response.totalHits) {
                        totalResultados = response.totalHits;                        
                    }
                    //verifica  se a quantidade de resultados é menor que o número de imagens por página
                    let j = imgPagina;
                    if(response.hits.length < j) {
                        j = response.hits.length;
                    }
                    //guarda as urls das imagens no array imagesUrl
                    for(let i = 0; i < j; i++) {                        
                        imagesUrl.push(response.hits[i].largeImageURL);
                    }
                }
            );
            //Retorna o array de imagens
            return imagesUrl;
        } catch (error) {
            //caso de algum erro exibe a menssagem erro seguido do erro que aconteceu.
            console.log("erro em pesquisaPixabayERetornaLinksImagens: ", error);
        }
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
                        imageIndex + "-" + content.sentencas[sentenceIndex].texto + "-pixabay.png",
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