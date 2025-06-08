//TODO: Nunggu model baru dipanggil ke sini

// Ini masih ngaco parah men

import { IncomingForm } from 'formidable';
import { readFile } from 'fs/promises';
import * as tf from '@tensorflow/tfjs-node';
import path from 'path';

let model;

const loadModel = async () => {
  if (!model) {
    const modelPath = `file://${path.resolve('./model/model.json')}`;
    model = await tf.loadLayersModel(modelPath);
  }
  return model;
};

const processImage = async (filepath) => {
  const buffer = await readFile(filepath);
  const tensor = tf.node.decodeImage(buffer)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims();
  return tensor;
};

export default [
  {
    method: 'POST',
    path: '/api/predict',
    options: {
      payload: {
        output: 'stream',
        parse: false,
        multipart: true,
        maxBytes: 10 * 1024 * 1024
      }
    },
    handler: async (request, h) => {
      const form = new IncomingForm({ uploadDir: './uploads', keepExtensions: true });

      return new Promise((resolve, reject) => {
        form.parse(request.raw.req, async (err, fields, files) => {
          if (err || !files.image) {
            console.error(err);
            return resolve(h.response({ error: 'Gagal upload gambar' }).code(400));
          }

          try {
            const imagePath = files.image[0].filepath;
            const inputTensor = await processImage(imagePath);
            const model = await loadModel();

            const prediction = model.predict(inputTensor);
            const result = prediction.dataSync();

            resolve(h.response({ prediction: Array.from(result) }).code(200));
          } catch (e) {
            console.error(e);
            resolve(h.response({ error: 'Gagal memproses prediksi' }).code(500));
          }
        });
      });
    }
  }
];
