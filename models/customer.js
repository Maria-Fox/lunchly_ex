/** Customer for Lunchly */
// The static keyword defines a static method or property for a class, or a class static initialization block.  Neither static methods nor static properties can be called on instances of the class. Instead, they're called on the class itself.

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */
// JS static methods == class instance methods

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    // creates new customer instance with customer row info. You're calling the CUSTOMER itself
    return new Customer(customer);
  }

  // function to render the customer full name

  fullName(){
    // at this point we would've already checked to ensure valid c.id
    // unsure if it even needs to be async?
    return `${this.firstName} ${this.lastName}`
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    // if the user does not currently exist
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      // get user id and add attribute to customer class instance
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
        WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
