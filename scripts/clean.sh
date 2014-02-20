#!/bin/bash
curl -H "Content-Type: application/json" -X POST http://tangerine:tangytangerine@localhost:5984/tangerine/_compact
curl -H "Content-Type: application/json" -X POST http://tangerine:tangytangerine@localhost:5984/tangerine/_compact/tangerine
curl -H "Content-Type: application/json" -X POST http://tangerine:tangytangerine@localhost:5984/tangerine/_view_cleanup
