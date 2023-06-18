#! /usr/bin/env node

const program = require('commander');

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { execSync } = require('child_process');
const { compileFunction } = require('vm');

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
      let freq_words = response.data.freq_words;
      freq_dict = {};
      for (let i = 0; i < freq_words.length; i++) {
        let words = freq_words[i].split(' ');
        freq_dict[words[1]] = words[0];
      }
      console.log(freq_dict);
    })
    .catch((error) => {
      console.error('Error:', error.response.data.error);
    });
}

program
    .version('0.0.1')
    .command('init <name.....>')
    .description('init project')
    .action((name) => {
        for(let i = 0; i < name.length; i++) {
            console.log(name[i]);
        }
    });

program
    .command('add <filename.....>')
    .description('add file to the file store')
    .action((filename) => {
        addFiles(filename);
    });

program
    .command('ls')
    .description('list files in the file store')
    .action(() => {
        listFiles();
    });

program
    .command('rm <filename>')
    .description('remove file from the file store')
    .action((filename) => {
        removeFile(filename);
    });

program
    .command('update <filename>')
    .description('update file in the file store')
    .action((filename) => {
        updateFile(filename);
    });

program
    .command('wc')
    .description('get word count')
    .action(() => {
        wordCount();
    });

program
    .command('freq-words [limit] [order]')
    .description('get most frequent words')
    .action((limit, order) => {
        frequentWords(limit, order);
    });

program.parse(process.argv);
