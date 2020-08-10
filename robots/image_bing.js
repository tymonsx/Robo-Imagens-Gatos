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

  const content = {
    sentences: [
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
      {
        text: "Solid Color",
        searchTerm: `"grey cat"`,
        pasta: "solid_color_grey",
      },
      {
        text: "Solid Color",
        searchTerm: `"orange cat"`,
        pasta: "solid_color_orange",
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
        text: "Spotted Tabby",
        searchTerm: `Spotted Tabby Cat`,
        pasta: "Spotted_Tabby",
      },
      {
        text: "Abyssinian Tabby",
        searchTerm: `Abyssinian Tabby`,
        pasta: "Abyssinian_Tabby",
      },
      {
        text: "Patched Tabby",
        searchTerm: `Patched Tabby Cat`,
        pasta: "Patched_Tabby",
      },
      {
        text: "Smoke",
        searchTerm: `Smoke Cat`,
        pasta: "Smoke",
      },
      
      {
        text: "Shaded",
        searchTerm: `Shaded Cat`,
        pasta: "Shaded",
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
        text: "Harlequin",
        searchTerm: `Harlequin Cat`,
        pasta: "Harlequin",
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
      },*/
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
    return new Promise((resolve, reject) => {
      try {
        let imagesUrl = [];
        //  for (let i = 1; i < 100; i = i + 10) {

        let req = unirest(
          "GET",
          "https://api.cognitive.microsoft.com/bing/v7.0/images/search"
        );
        req.query({
          q: query,
        });

        req.headers({
          "Ocp-Apim-Subscription-Key": bingSearchCredentials.apiKey,
        });

        req.end(function (res) {
          if (res.error) throw new Error(res.error);
          imagesUrl = imagesUrl.concat(
            res.body.value.map((item) => {
              return item.contentUrl;
            })
          );
          // console.log("imagesUrl: ", imagesUrl);
          resolve(imagesUrl);
          //console.log("body: ", res.body);
          //console.dir(res.body, { depth: null });
          /*
        console.log(
          "teste: ",
          res.body.value.map((item) => {
            return item.contentUrl;
          })
        );
        */
        });

        //console.log("seila: ", req);
        /*
      imagesUrl = imagesUrl.concat(
        response.data.items.map((item) => {
          return item.contentUrl;
        })
      );

      //}
      return imagesUrl;
      */
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
