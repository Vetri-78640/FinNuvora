const express = require('express');
const { createGoal, getGoals, updateGoalProgress, updateGoal, deleteGoal } = require('../controllers/goalController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id/progress', updateGoalProgress);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
