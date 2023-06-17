const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'files');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

const fileStore = {};

app.post('/add', upload.array('files'), (req, res) => {
  const files = req.files;
  for (const file of files) {
    const { originalname, path } = file;
    if (fileStore[originalname]) {
      return res.json({ error: 'File already exists' });
    }
    fileStore[originalname] = path;
  }
  return res.json({ message: 'Files added successfully' });
});

app.get('/list', (req, res) => {
  const files = Object.keys(fileStore);
  return res.json({ files });
});

app.delete('/remove', (req, res) => {
  const filename = req.query.filename;
  if (fileStore[filename]) {
    fs.unlinkSync(fileStore[filename]); 
    delete fileStore[filename];
    return res.json({ message: 'File removed successfully' });
  } else {
    return res.json({ error: 'File not found' });
  }
});

app.put('/update', upload.single('file'), (req, res) => {
  const { filename } = req.body;
  const { originalname, path } = req.file;
  if (fileStore[filename]) {
    delete fileStore[filename];
  }
  fileStore[originalname] = path;
  return res.json({ message: 'File updated successfully' });
});

app.get('/wc', (req, res) => {
    wc_count = {};
    for (const filename of Object.values(fileStore)) {
        const wcCommand = `cat ${filename} | wc -w`;
        const output = execSync(wcCommand).toString().trim();
        newfilename = filename.split('/')[1];
        wc_count[newfilename] = parseInt(output);
    }
    return res.json({ word_count: wc_count});
});

app.get('/freq-words', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const order = req.query.order || 'asc';
  if (order == 'asc') {
    freqWordsCommand = `cat files/* | tr -s ' ' '\n' | sort | uniq -c | sort -n | tail -n ${limit}`;
    } else {
    freqWordsCommand = `cat files/* | tr -s ' ' '\n' | sort | uniq -c | sort -nr | tail -n ${limit}`;
    }
  const output = execSync(freqWordsCommand).toString().trim();
  console.log(output);
  return res.json({ freq_words: output});
//   const freqWords = output
//     .split('\n')
//     .map((line) => line.split(' ').slice(1).join(' ').trim());
//   return res.json({ freq_words: freqWords });
});

function populateFileStore() {
    fs.readdirSync('files').forEach((filename) => {
        fileStore[filename] = `files/${filename}`;
    });
}

populateFileStore();
console.log(fileStore);

app.listen(5000, () => {
  console.log('File store server is running on http://localhost:5000');
});
