const express = require('express');
const {
  getPreferences,
  updatePreferences,
  resetPreferences
} = require('../controllers/preferencesController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getPreferences);
router.put('/', updatePreferences);
router.delete('/', resetPreferences);

module.exports = router;
