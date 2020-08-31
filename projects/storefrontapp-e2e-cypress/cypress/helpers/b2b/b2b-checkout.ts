import { SampleCartProduct, SampleUser } from '../../sample-data/checkout-flow';
import {
  addCheapProductToCart,
  verifyReviewOrderPage,
  waitForPage,
} from '../checkout-flow';
import {
  poNumber,
  POWERTOOLS_BASESITE,
  POWERTOOLS_DEFAULT_DELIVERY_MODE,
  products,
} from './b2b';

export function addB2bProductToCartAndCheckout() {
  cy.visit(`${POWERTOOLS_BASESITE}/en/USD/product/${products[0].code}`);
  cy.get('cx-product-intro').within(() => {
    cy.get('.code').should('contain', products[0].code);
  });
  cy.get('cx-breadcrumb').within(() => {
    cy.get('h1').should('contain', products[0].name);
  });

  addCheapProductToCart(products[0]);

  const paymentTypePage = waitForPage(
    '/checkout/payment-type',
    'getPaymentType'
  );
  cy.getByText(/proceed to checkout/i).click();
  cy.wait(`@${paymentTypePage}`).its('status').should('eq', 200);
}

export function enterPONumber() {
  cy.get('cx-payment-type .cx-payment-type-container').should(
    'contain',
    'Payment method'
  );
  cy.get('cx-payment-type').within(() => {
    cy.get('.form-control').clear().type(poNumber);
  });
}

export function selectAccountPayment() {
  cy.get('cx-payment-type').within(() => {
    cy.getByText('Account').click({ force: true });
  });

  const shippingPage = waitForPage(
    '/checkout/shipping-address',
    'getShippingPage'
  );
  cy.get('button.btn-primary').click({ force: true });
  cy.wait(`@${shippingPage}`).its('status').should('eq', 200);
}

export function selectCreditCardPayment() {
  cy.get('cx-payment-type').within(() => {
    cy.getByText('Credit Card').click({ force: true });
  });

  const shippingPage = waitForPage(
    '/checkout/shipping-address',
    'getShippingPage'
  );
  cy.get('button.btn-primary').click({ force: true });
  cy.wait(`@${shippingPage}`).its('status').should('eq', 200);
}

export function selectAccountShippingAddress() {
  cy.get('.cx-checkout-title').should('contain', 'Shipping Address');
  cy.get('cx-order-summary .cx-summary-partials .cx-summary-row')
    .first()
    .find('.cx-summary-amount')
    .should('not.be.empty');

  cy.server();

  cy.route(
    'GET',
    `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
      'BASE_SITE'
    )}/users/current/carts/*`
  ).as('getCart');
  cy.get('cx-card').within(() => {
    cy.get('.cx-card-label-bold').should('not.be.empty');
    cy.get('.cx-card-actions .cx-card-link').click({ force: true });
  });

  cy.wait('@getCart');
  cy.get('cx-card .card-header').should('contain', 'Selected');

  const deliveryPage = waitForPage(
    '/checkout/delivery-mode',
    'getDeliveryPage'
  );
  cy.get('button.btn-primary').click({ force: true });
  cy.wait(`@${deliveryPage}`).its('status').should('eq', 200);
}

export function selectAccountDeliveryMode(
  deliveryMode: string = POWERTOOLS_DEFAULT_DELIVERY_MODE
) {
  cy.get('.cx-checkout-title').should('contain', 'Shipping Method');
  cy.get(`#${deliveryMode}`).should('be.checked');
  const orderReview = waitForPage('/checkout/review-order', 'getReviewOrder');
  cy.get('.cx-checkout-btns button.btn-primary').click();
  cy.wait(`@${orderReview}`).its('status').should('eq', 200);
}

export function placeAccountOrder(
  user: SampleUser,
  cartData: SampleCartProduct
) {
  verifyReviewOrderPage();
  cy.get('.cx-review-summary-card')
    .contains('cx-card', 'Purchase order Number')
    .find('.cx-card-container')
    .within(() => {
      cy.getByText('None');
    });
  cy.get('.cx-review-summary-card')
    .contains('cx-card', 'Method of Payment')
    .find('.cx-card-container')
    .within(() => {
      cy.getByText('Account');
    });
  cy.get('.cx-review-summary-card')
    .contains('cx-card', 'Cost Center')
    .find('.cx-card-container')
    .within(() => {
      cy.getByText('Custom Retail');
      cy.getByText('(Custom Retail)');
    });
  cy.get('.cx-review-summary-card')
    .contains('cx-card', 'Ship To')
    .find('.cx-card-container')
    .within(() => {
      cy.getByText(user.fullName);
      cy.getByText(user.address.line1);
      cy.getByText(user.address.line2);
    });
  cy.get('.cx-review-summary-card')
    .contains('cx-card', 'Shipping Method')
    .find('.cx-card-container')
    .within(() => {
      cy.getByText('Standard Delivery');
    });
  cy.get('cx-order-summary .cx-summary-row .cx-summary-amount')
    .eq(0)
    .should('contain', cartData.total);
  cy.get('cx-order-summary .cx-summary-row .cx-summary-amount')
    .eq(1)
    .should('contain', cartData.estimatedShipping);
  cy.get('cx-order-summary .cx-summary-total .cx-summary-amount').should(
    'contain',
    cartData.totalAndShipping
  );
  cy.getByText('Terms & Conditions')
    .should('have.attr', 'target', '_blank')
    .should(
      'have.attr',
      'href',
      `/${Cypress.env('BASE_SITE')}/en/USD/terms-and-conditions`
    );
  cy.get('input[formcontrolname="termsAndConditions"]').check();
  const orderConfirmationPage = waitForPage(
    '/order-confirmation',
    'getOrderConfirmationPage'
  );
  cy.get('cx-place-order button.btn-primary').click();
  cy.wait(`@${orderConfirmationPage}`).its('status').should('eq', 200);
}