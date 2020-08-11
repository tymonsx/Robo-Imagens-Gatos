//const https = require("https");
const unirest = require("unirest");
const imageDownloader = require("image-downloader");
const bingSearchCredentials = require("../credentials/azure-search.json");
const bingHost = "api.cognitive.microsoft.com";
const bingPath = "/bing/v7.0/images/search";
const state = require("./state.js");
const fs = require("fs");
const { promises } = require("dns");
//const googleSearchCredentials = require("../credentials/google-search.json");
async function robot() {
  //const content = state.load();
  let totalEstimatedMatches = 1000;
  let imagesUrl = [];
  const content = {
    sentences: [
      /*
      {
        text: "Solid Color",
        searchTerm: `"white cat"`,
        pasta: "solid_color_white",
      },
      

      {
        text: "Solid Color",
        searchTerm: `"black cat"`,
        pasta: "solid_color_black",
      },
      */

      {
        text: "Solid Color",
        searchTerm: `"grey cat"`,
        pasta: "solid_color_grey",
      },
      /*
      {
        text: "Tortoiseshell",
        searchTerm: `Tortoiseshell Cat`,
        pasta: "Tortoiseshell",
      },
    
      {
        text: "Calico",
        searchTerm: `Calico Cat`,
        pasta: "Calico",
      },
       

      {
        text: "Tabby Mackerel",
        searchTerm: `Tabby Mackerel`,
        pasta: "Tabby_Mackerel",
      },
      
      {
        text: "Blotched Tabby",
        searchTerm: `Blotched Tabby`,
        pasta: "Blotched_Tabby",
      },
     

      {
        text: "Classic Tabby",
        searchTerm: `Classic Tabby`,
        pasta: "Classic_Tabby",
      }, 
      
      {
        text: "Spotted Tabby",
        searchTerm: `Spotted Tabby Cat`,
        pasta: "Spotted_Tabby",
      },
      

      {
        text: "Bicolor",
        searchTerm: `Bicolor Cat`,
        pasta: "Bicolor",
      },
      

      {
        text: "Chinchilla",
        searchTerm: `Chinchilla Cat`,
        pasta: "Chinchilla",
      },
     

      {
        text: "Colorpoint",
        searchTerm: `Colorpoint Cat`,
        pasta: "Colorpoint",
      }, 

      {
        text: "Hairless",
        searchTerm: `Hairless Cat`,
        pasta: "Hairless",
      } ,
      */
    ],
  };

  await fetchImagesOfAllSentences(content);
  // console.log("conteudo: ", content.sentences[0].images);
  await downloadAllImages(content);
  //state.save(content);

  async function fetchImagesOfAllSentences(content) {
    return new Promise(async (resolve) => {
      for (const sentence of content.sentences) {
        sentence.images = await fetchBingAndReturnImagesLinks(
          sentence.searchTerm
        );
      }
      resolve();
    });

    /*
    let teste = await fetchBingAndReturnImagesLinks(
      content.sentences[0].searchTerm
    );
    */
    /*
    fetchBingAndReturnImagesLinks(content.sentences[0].searchTerm).then(
      (teste) => {
        console.log("testou: ", teste);
      }
    );
    */
    // console.log("testou: ", teste);
  }
  async function fetchBingAndReturnImagesLinks(query) {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < totalEstimatedMatches; i = i + 150) {
          await fetchBingAndReturnImagesLinksOffset(query, i);
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

  async function fetchBingAndReturnImagesLinksOffset(query, offset) {
    return new Promise(async (resolve, reject) => {
      try {
        let req = unirest(
          "GET",
          "https://api.cognitive.microsoft.com/bing/v7.0/images/search"
        );
        // console.log("i: " + i);
        req.query({
          q: query,
          count: 150,
          imageType: "Photo",
          offset: offset,
        });

        req.headers({
          "Ocp-Apim-Subscription-Key": bingSearchCredentials.apiKey,
        });

        await req.end(function (res) {
          if (res.error) throw new Error(res.error);
          if (totalEstimatedMatches > res.body.totalEstimatedMatches) {
            totalEstimatedMatches = res.body.totalEstimatedMatches;
            console.log("Total estimado de imagens: ", totalEstimatedMatches);
          }

          imagesUrl = imagesUrl.concat(
            res.body.value.map((item) => {
              return item.contentUrl;
            })
          );
          // console.log("imagesUrl: ", imagesUrl);
          resolve(imagesUrl);
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
  async function downloadAllImages(content) {
    return new Promise(async (resolve) => {
      content.downloadedImages = [];

      for (
        let sentenceIndex = 0;
        sentenceIndex < content.sentences.length;
        sentenceIndex++
      ) {
        const images = content.sentences[sentenceIndex].images;

        for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
          const imageUrl = images[imageIndex];

          try {
            //await downloadImage()
            if (content.downloadedImages.includes(imageUrl)) {
              throw new Error("Imagem já foi baixada");
            }
            await downloadAndSave(
              imageUrl,
              imageIndex + "-original.png",
              content.sentences[sentenceIndex].pasta
            );
            content.downloadedImages.push(imageUrl);
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
      resolve();
    });
  }

  async function downloadAndSave(url, fileName, pasta) {
    const dir = "./content_bing/" + pasta;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    return imageDownloader.image({
      url,
      url,
      dest: "./content_bing/" + pasta + "/" + fileName,
    });
  }
}

module.exports = robot;
