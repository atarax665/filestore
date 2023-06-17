const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { execSync } = require('child_process');

const SERVER_URL = 'http://localhost:5000';

function addFiles(filenames) {
  const form = new FormData();
  for (const filename of filenames) {   
    const fileStream = fs.createReadStream(filename);
    form.append('files', fileStream);
  }
  axios
    .post(`${SERVER_URL}/add`, form, {
      headers: form.getHeaders(),
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

function listFiles() {
  axios
    .get(`${SERVER_URL}/list`)
    .then((response) => {
      console.log(response.data.files);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

function removeFile(filename) {
  axios
    .delete(`${SERVER_URL}/remove?filename=${filename}`, {
      data: { filename },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

function updateFile(filename) {
  const form = new FormData();
  const fileStream = fs.createReadStream(filename);
  form.append('file', fileStream);
  form.append('filename', filename);
  axios
    .put(`${SERVER_URL}/update`, form, {
      headers: form.getHeaders(),
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

function wordCount() {
  axios
    .get(`${SERVER_URL}/wc`)
    .then((response) => {
        console.log(response.data);
    //   console.log(`Total word count: ${response.data.word_count}`);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

function frequentWords(limit = 10, order = 'asc') {
  axios
    .get(`${SERVER_URL}/freq-words?limit=${limit}&order=${order}`)
    .then((response) => {
      console.log(`Most frequent words (limit=${limit}, order=${order}):`);
      console.log(response.data.freq_words);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

function parseArguments() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'add':
      const filenames = args.slice(1);
      addFiles(filenames);
      break;
    case 'ls':
      listFiles();
      break;
    case 'rm':
      const filename = args[1];
      removeFile(filename);
      break;
    case 'update':
      const updateFilename = args[1];
      updateFile(updateFilename);
      break;
    case 'wc':
      wordCount();
      break;
    case 'freq-words':
      const limit = parseInt(args[1]) || 10;
      const order = args[2] || 'asc';
      frequentWords(limit, order);
      break;
    default:
      console.error('Invalid command');
      break;
  }
}

parseArguments();

// Asc cat * | tr -s ' ' '\n' | sort | uniq -c | sort -n | tail -n 10
// Desc cat files/* | tr -s ' ' '\n' | sort | uniq -c | sort -nr | head -n 10