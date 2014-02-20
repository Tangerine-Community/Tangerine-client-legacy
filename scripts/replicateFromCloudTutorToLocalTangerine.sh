#!/bin/bash
curl -X POST http://127.0.0.1:5984/_replicate  -d '{"source":"http://tangerine:tangytangerine@databases.tangerinecentral.org/group-tutor", "target":"tangerine"}' -H "Content-Type: application/json"
