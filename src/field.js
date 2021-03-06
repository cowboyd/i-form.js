import Validation from './validation';

export default class Field {

  static create(options = {}) {
    let { value = null,
          input = null,
          rules = {},
          dependencies = {}
        } = options;

    // create a Validation out of the rules passed in
    let validation = Validation.create({
      rules,
      dependencies
    });

    return new IdleField({
      value,
      input: value,
      validation
    });
  }

  constructor(attrs = {}, overrides = {}) {
    Object.assign(this, {
      validation: {}
    }, attrs, overrides);
  }

  get isIdle() { return false; }
  get isValidating() { return false; }
  get isValid() { return false; }
  get isInvalid() { return false;  }

  get isChanged() { return this.input !== this.value; }
  get isUnchanged() { return !this.isChanged }

  get rules() {
    return this.validation.rules;
  }

  setInput(input) {
    return new ValidatingField(this, { input });
  }
}

export class IdleField extends Field {
  get isIdle() { return true; }

  validate() {
    return new ValidatingField(this, {
      validation: this.validation.setInput(this.input)
    });
  }

  setInput(input) {
    return new IdleField(this, { input });
  }
}

export class ValidatingField extends Field {
  get isValidating() { return true; }

  fulfill(rule) {
    let validation = this.validation.fulfill(rule);

    if(validation.isFulfilled) {
      return new ValidField(this, { validation });
    } else {
      return new ValidatingField(this, { validation });
    }
  }

  reject(rule, reason) {
    return new InvalidField(this);
  }

  run(rule) {
    return new ValidatingField(this, {
      validation: this.validation.run(rule)
    })
  }
}

export class ValidField extends Field {
  get isValid() { return true; }
}

export class InvalidField extends Field {
  get isInvalid() { return true; }

  fulfill(rule) {
    return new InvalidField(this);
  }

  reject(rule, reason) {
    return new InvalidField(this);
  }
}
