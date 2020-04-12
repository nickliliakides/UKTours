import axios from 'axios'
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_1uFS328FUHlSvEL92QvyPQQT00RDbHFfVL');

export const bookTour = async tourId => {
  try {
    // Get checkout session from API
    const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  } catch(err) {
    console.log(err);
    showAlert('error', err)
  }


};
