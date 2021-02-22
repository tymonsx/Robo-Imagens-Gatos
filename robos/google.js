const imageDownloader = require("image-downloader");
const fs = require("fs");
const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const googleSearchCredenciais = require("../credenciais/google-search.json");


async function robo() {
    console.log('Inicio do robo de imagens do Google');
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
    
    await retornaTodasImagensDeTodasSentencas(content);
    await baixarTodasImagens(content);

    async function retornaTodasImagensDeTodasSentencas(content) {    
        for (const sentenca of content.sentencas) {        
            sentenca.imagens = await pesquisaGoogleERetornaLinksImagens(
                sentenca.termoBusca
            );
        }
    }
    
    async function pesquisaGoogleERetornaLinksImagens(termoBusca) {
        try {
        //prepara array que receberá os links das imagens
            let imagesUrl = []; 
            //loop que vai definir o inicio dos 10 resultados que trará
            for (let i = 1; i < 10; i = i + 10) {
            //o termo start do custom search determina o ponto inicial dos resultados e retornará os 10 resultados subsequentes
                const response = await customSearch.cse.list({                
                    auth: googleSearchCredenciais.apiKey,                    
                    cx: googleSearchCredenciais.searchEngineId,                
                    q: termoBusca,                
                    searchType: "image",                                
                    start: i,                
                });                      
                //gera um array somente com os links das imagens que retornou
                imagesUrl = imagesUrl.concat(                
                    response.data.items.map((item) => {                
                        return item.link;
                    })
                );
            }
            //imprime o array de imagens que retornou do google search
            console.log(imagesUrl);
            return imagesUrl;
            
        } catch (error) {
            console.log(error);            
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
                    //faz o download da imagem utilizando o texto da sentença e o indici para montar o nome do arquivo
                    await download(
                        imageUrl,
                        imageIndex + "-" + content.sentencas[sentenceIndex].texto + "-google.png",
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