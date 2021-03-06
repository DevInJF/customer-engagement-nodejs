/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-env es6 */
require('dotenv').config({ silent: true });

const express = require('express');
const app = express();

// Bootstrap application settings
require('./config/express')(app);

const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const toneAnalyzer = new ToneAnalyzerV3({
  // If unspecified here, the TONE_ANALYZER_USERNAME and
  // TONE_ANALYZER_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api',
  version_date: '2016-05-19',
  headers: {
    'X-Watson-Learning-Opt-Out': true,
  },
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/tone_chat', (req, res, next) => {
  toneAnalyzer.tone_chat(req.body, (err, tone) => {
    if (err) {
      return next(err);
    }
    return res.json(tone);
  });
});


// Endpoint test for call to tone-analyzer
// if an error is returned from a request to the tone-analyzer tone_chat endpoint,
// return a 502, otherwise return a 200.
app.get('/healthcheck', (req, res) => {
  const start = new Date();
  const payload = { utterances: [{ text: 'sad', user: 'customer' }] };

  toneAnalyzer.tone_chat(payload, (err) => {
    const response = {
      status: 'normal',
      response_time: (new Date() - start),
    };

    if (err) {
      Object.assign(response, { status: 'down', error: err });
      return res.status(502).json(response);
    }
    return res.json(response);
  });
});


// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
