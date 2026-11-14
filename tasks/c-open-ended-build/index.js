'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { matchMentors } = require('./matcher');

const mentorsPath = process.argv[2] || path.join(__dirname, 'starter', 'mentors.json');
const startupsPath = process.argv[3] || path.join(__dirname, 'starter', 'startups.json');
const mentors = JSON.parse(fs.readFileSync(mentorsPath, 'utf8'));
const startups = JSON.parse(fs.readFileSync(startupsPath, 'utf8'));

console.log(JSON.stringify(matchMentors(mentors, startups), null, 2));
