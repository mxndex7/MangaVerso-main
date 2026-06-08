from marshmallow import Schema, fields, validates, ValidationError, INCLUDE
from .checkout_schema import checkout_schema


class AddToCartSchema(Schema):
    
    class Meta:
        unknown = INCLUDE                                

    nome = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    preco = fields.Float(required=True, validate=lambda x: x > 0)

    @validates('nome')
    def validate_nome(self, value):
        if not value or len(value.strip()) == 0:
            raise ValidationError('Nome do produto não pode estar vazio')


                     
add_to_cart_schema = AddToCartSchema()