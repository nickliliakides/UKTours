const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('../controllers/userController');
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo
} = require('../controllers/authController');

const router = express.Router();

router.get('/logout', logout);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/update-my-password', updatePassword);
router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/delete-me', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
// .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
