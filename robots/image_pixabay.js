const imageDownloader = require("image-downloader");
const pixabayApi = require("pixabay-api")
const state = require("./state.js");
const fs = require("fs");

const pixabayCredentials = require("../credentials/pixabay.json");
async function robot() {

  const content = {
    sentences: [
      {
        text: "Solid Color",
        searchTerm: "white cat",
        pasta: "solid_color_white",
      },
      {
        text: "Solid Color",
        searchTerm: "black cat",
        pasta: "solid_color_black",
      },
      {
        text: "Solid Color",
        searchTerm: "grey cat",
        pasta: "solid_color_grey",
      },
      {
        text: "Solid Color",
        searchTerm: "orange cat",
        pasta: "solid_color_orange",
      },
      {
        text: "Tabby Mackerel",
        searchTerm: "Tabby Mackerel",
        pasta: "Tabby_Mackerel",
      }
    ],
  };

  await fetchTodasImagens(content);

  await downloadTodasImagens(content);
  //state.save(content);

  //pixabayApi.searchImages(pixabayCredentials.apiKey, 'white cat', {per_page: 100}).then((r) => console.log(r));

  async function fetchTodasImagens(content) {
    for (const sentence of content.sentences) {
      sentence.images = await fetchLinksImagensPixabay(
        sentence.searchTerm
      );
    }
  }
  async function fetchLinksImagensPixabay(query) {
    
    try {
      let imagesUrl = [];

      await pixabayApi.searchImages(pixabayCredentials.apiKey, query, {per_page: 100}).then(
        function(response) {
          console.log("totalHits: ", response.totalHits);
          console.log("response: ", response);
         
          let j = 100;
          if(response.totalHits < 100) {
            j = response.totalHits;
          }
          for(let i = 0; i < 100; i++) {
            imagesUrl.push(response.hits[i].largeImageURL);
          }
        }
      );
      console.log("imagesUrl ", imagesUrl);
      return imagesUrl;
    } catch (error) {
      console.log("erro");
    }
  }
  async function downloadTodasImagens(content) {
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
  }

  async function downloadAndSave(url, fileName, pasta) {
    const dir = "./content_pixabay/" + pasta;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    return imageDownloader.image({
      url,
      url,
      dest: "./content_pixabay/" + pasta + "/" + fileName,
    });
  }
}

module.exports = robot;
