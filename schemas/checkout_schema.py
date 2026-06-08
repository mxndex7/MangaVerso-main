from marshmallow import Schema, fields, validates, validates_schema, ValidationError, INCLUDE
from utils.validators import sanitize_string


class CheckoutSchema(Schema):

    class Meta:
        unknown = INCLUDE                                               

                    
    fullName = fields.Str(required=True, validate=lambda x: len(x.strip()) >= 2)
    email = fields.Email(required=True)
    phone = fields.Str(required=True)
    cpf = fields.Str(required=True)
    birthDate = fields.Str(required=False, allow_none=True)                                 

              
    cep = fields.Str(required=True)
    street = fields.Str(required=True)
    number = fields.Str(required=True)
    neighborhood = fields.Str(required=True)
    city = fields.Str(required=True)
    state = fields.Str(required=True)
    complement = fields.Str(required=False, allow_none=True)

               
    paymentMethod = fields.Str(required=False, missing='creditCard')
    cardNumber = fields.Str(required=False, allow_none=True)
    cardName = fields.Str(required=False, allow_none=True)
    expiryDate = fields.Str(required=False, allow_none=True)
    cvv = fields.Str(required=False, allow_none=True)
    installments = fields.Int(required=False, default=1, validate=lambda x: 1 <= x <= 12)
    couponCode = fields.Str(required=False, allow_none=True)

                      
    subtotal = fields.Float(required=False, allow_none=True)
    shipping = fields.Float(required=False, allow_none=True)
    discount = fields.Float(required=False, allow_none=True)
    total = fields.Float(required=False, allow_none=True)

    @validates('fullName')
    def validate_full_name(self, value):
        if not value or len(value.strip()) < 2:
            raise ValidationError('Nome deve ter pelo menos 2 caracteres.')

    @validates('phone')
    def validate_phone(self, value):
                                         
        clean_phone = ''.join(filter(str.isdigit, value))
        if len(clean_phone) < 10 or len(clean_phone) > 11:
            raise ValidationError('Telefone deve ter 10 ou 11 dígitos.')

    @validates('cpf')
    def validate_cpf(self, value):
                                                                       
        clean_cpf = ''.join(filter(str.isdigit, value))
        if len(clean_cpf) != 11:
            raise ValidationError('CPF deve ter 11 dígitos.')

    @validates('cep')
    def validate_cep(self, value):
        clean_cep = ''.join(filter(str.isdigit, value))
        if len(clean_cep) != 8:
            raise ValidationError('CEP deve ter 8 dígitos.')

    @validates('paymentMethod')
    def validate_payment_method(self, value):
        if value not in {'creditCard', 'debitCard', 'pix'}:
            raise ValidationError('Forma de pagamento inválida.')

    @validates('couponCode')
    def validate_coupon_code(self, value):
        if value and value.upper() not in {'M10', 'M30'}:
            raise ValidationError('Cupom inválido.')

    @validates_schema
    def validate_payment_fields(self, data, **kwargs):
        payment_method = data.get('paymentMethod')
        if payment_method not in {'creditCard', 'debitCard'}:
            return

        required_fields = {
            'cardNumber': 'Número do cartão obrigatório.',
            'cardName': 'Nome no cartão obrigatório.',
            'expiryDate': 'Validade obrigatória.',
            'cvv': 'CVV obrigatório.'
        }

        errors = {}
        for field_name, message in required_fields.items():
            value = data.get(field_name) or ''
            if not str(value).strip():
                errors[field_name] = [message]

        card_number = ''.join(filter(str.isdigit, data.get('cardNumber') or ''))
        if card_number and len(card_number) < 13:
            errors['cardNumber'] = ['Número de cartão inválido.']

        card_name = data.get('cardName') or ''
        if card_name and len(card_name.strip()) < 2:
            errors['cardName'] = ['Nome no cartão inválido.']

        cvv = ''.join(filter(str.isdigit, data.get('cvv') or ''))
        if cvv and len(cvv) < 3:
            errors['cvv'] = ['CVV inválido.']

        if errors:
            raise ValidationError(errors)


                     
checkout_schema = CheckoutSchema()
