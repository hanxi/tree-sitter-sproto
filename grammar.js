module.exports = grammar({
  name: 'sproto',

  // The extras array tells tree-sitter that these tokens can appear anywhere in the grammar.
  // We'll put whitespace and comments here.
  extras: $ => [
    /\s/,
    $.comment,
  ],

  rules: {
    // source_file is the root node, and it can contain multiple definitions.
    source_file: $ => repeat(
      choice(
        $.type_definition,
        $.protocol_definition
      )
    ),

    // A comment starts with # and continues to the end of the line.
    comment: $ => /#.*/,

    // =============================================
    // Type definition (e.g., .Person { ... })
    // =============================================
    type_definition: $ => seq(
      '.',
      field('name', $.identifier),
      '{',
      field('body', repeat($.field_definition)),
      '}'
    ),

    // Field definition (e.g., name 0 : *string(integer))
    field_definition: $ => seq(
      field('name', $.identifier),
      field('tag', $.integer),
      ':',
      optional(field('is_array', '*')),
      field('type', $.identifier),
      optional(field('map_key_type', $.map_specifier))
    ),

    // Map key type definition (e.g., (string))
    map_specifier: $ => seq(
      '(',
      field('key', $.identifier), // Usually integer or string
      ')'
    ),

    // =============================================
    // Protocol definition (e.g., foobar 1 { ... })
    // =============================================
    protocol_definition: $ => seq(
      field('name', $.identifier),
      field('tag', $.integer),
      '{',
      field('body', repeat(
        choice(
          $.request_block,
          $.response_block,
          $.type_definition,
        )
      )),
      '}'
    ),

    request_block: $ => seq(
      'request',
      optional(
        seq(
          '{',
          field('body', repeat($.field_definition)),
          '}'
        )
      )
    ),

    response_block: $ => seq(
      'response',
      optional(
        seq(
          '{',
          field('body', repeat($.field_definition)),
          '}'
        )
      )
    ),

    // =============================================
    // Basic Tokens
    // =============================================
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    integer: $ => /\d+/,
  }
});
