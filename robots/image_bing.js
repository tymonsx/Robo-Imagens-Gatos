const imageDownloader = require("image-downloader");
const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const state = require("./state.js");
const fs = require("fs");

//const googleSearchCredentials = require("../credentials/google-search.json");
async function robot() {
  //const content = state.load();
  console.log("Vai baixar do bing");
  process.exit(0);
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

  await downloadAllImages(content);
  //state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.images = await fetchGoogleAndReturnImagesLinks(
        sentence.searchTerm
      );
    }
  }
  async function fetchGoogleAndReturnImagesLinks(query) {
    try {
      let imagesUrl = [];
      for (let i = 1; i < 100; i = i + 10) {
        const response = await customSearch.cse.list({
          auth: googleSearchCredentials.apiKey,
          cx: googleSearchCredentials.searchEngineId,
          q: query,
          searchType: "image",
          start: i,
        });
        console.log(response);
        imagesUrl = imagesUrl.concat(
          response.data.items.map((item) => {
            return item.link;
          })
        );
      }
      return imagesUrl;
    } catch (error) {
      console.log(response);
    }
  }
  async function downloadAllImages(content) {
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
