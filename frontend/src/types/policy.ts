interface OdrlConstraint {
    'odrl:leftOperand': string | { '@id': string };
    'odrl:operator': string | { '@id': string };
    'odrl:rightOperand': string | number | { '@value': string; '@type': string };
}

interface OdrlAction {
    '@id'?: string;
}

interface OdrlRule {
    'odrl:action': OdrlAction | string;
    'odrl:constraint'?: OdrlConstraint;
}

export interface OdrlPolicy {
    '@id': string;
    '@type': string;
    'odrl:permission': OdrlRule | OdrlRule[];
    'odrl:prohibition': OdrlRule | OdrlRule[];
    'odrl:obligation': OdrlRule | OdrlRule[];
}