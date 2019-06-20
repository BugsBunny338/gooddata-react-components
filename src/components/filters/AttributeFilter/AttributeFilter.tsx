// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as PropTypes from "prop-types";
import { SDK, factory as createSdk } from "@gooddata/gooddata-js";
import pick = require("lodash/pick");

import { IntlWrapper } from "../../core/base/IntlWrapper";
import { injectIntl } from "react-intl";
import { AttributeDropdown, AttributeDropdownWrapped } from "./AttributeDropdown";
import { AttributeLoader } from "./AttributeLoader";
import { IAttributeDisplayForm } from "./model";
import { setTelemetryHeaders } from "../../../helpers/utils";

export interface IAttributeFilterProps {
    sdk?: SDK;
    filter: any; // JZA TODO: make the types more specific (FET-282)
    projectId?: string;
    metadata?: {
        getObjectUri: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
        getObjectDetails: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    };
    onApply: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    fullscreenOnMobile?: boolean;
    locale?: string;
    FilterLoading?: any;
    FilterError?: any;
}

const DefaultFilterLoading = injectIntl(({ intl }) => {
    return (
        <button className="button button-secondary button-small icon-right icon disabled s-button-loading">
            {intl.formatMessage({ id: "gs.filter.loading" })}
        </button>
    );
});

const DefaultFilterError = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error">{text}</div>;
});

/**
 * AttributeFilter
 * is a component that renders a dropdown populated with attribute values
 */
export class AttributeFilter extends React.PureComponent<IAttributeFilterProps> {
    public static propTypes = {
        filter: PropTypes.object.isRequired,
        projectId: PropTypes.string,
        onApply: PropTypes.func.isRequired,
        fullscreenOnMobile: PropTypes.bool,
        FilterLoading: PropTypes.func,
        FilterError: PropTypes.func,
        locale: PropTypes.string,
    };

    public static defaultProps: Partial<IAttributeFilterProps> = {
        projectId: null,
        locale: "en-US",

        FilterLoading: DefaultFilterLoading,
        FilterError: DefaultFilterError,
        fullscreenOnMobile: false,
    };

    private sdk: SDK;

    constructor(props: IAttributeFilterProps) {
        super(props);

        const sdk = props.sdk || createSdk();
        this.sdk = sdk.clone();
        setTelemetryHeaders(this.sdk, "AttributeFilter", props);
    }

    public componentWillReceiveProps(nextProps: IAttributeFilterProps) {
        if (nextProps.sdk && this.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk.clone();
            setTelemetryHeaders(this.sdk, "AttributeFilter", nextProps);
        }
    }

    public render() {
        const { locale, projectId } = this.props;
        const { md } = this.sdk;
        const { identifier, uri } = this.getIdentifierAndUri();

        return (
            <IntlWrapper locale={locale}>
                <AttributeLoader uri={uri} identifier={identifier} projectId={projectId} metadata={md}>
                    {props => this.renderContent(props)}
                </AttributeLoader>
            </IntlWrapper>
        );
    }

    private isInverted() {
        const { filter } = this.props;

        return filter.positiveAttributeFilter ? false : true;
    }

    private getIdentifierAndUri() {
        const { filter } = this.props;
        const filterType = this.isInverted() ? "negativeAttributeFilter" : "positiveAttributeFilter";
        const identifier = filter[filterType].displayForm.identifier;
        const uri = filter[filterType].displayForm.uri;

        return {
            identifier,
            uri,
        };
    }

    private getSelection() {
        const { filter } = this.props;
        const filterType = this.isInverted() ? "negativeAttributeFilter" : "positiveAttributeFilter";
        const inType = this.isInverted() ? "notIn" : "in";
        const textFilter = filter[filterType].textFilter;
        const selection = filter[filterType][inType];

        return selection
            ? selection.map((uriOrTitle: string) => ({
                  [textFilter ? "title" : "uri"]: uriOrTitle,
              }))
            : [];
    }

    private renderContent({
        isLoading,
        attributeDisplayForm,
    }: {
        isLoading: boolean;
        attributeDisplayForm: IAttributeDisplayForm;
    }) {
        if (isLoading) {
            return <this.props.FilterLoading />;
        }

        const dropdownProps: any = pick(this.props, Object.keys(AttributeDropdownWrapped.propTypes));
        const { identifier } = this.getIdentifierAndUri();
        const isUsingIdentifier = !!identifier;
        const { md } = this.sdk;
        return (
            <AttributeDropdown
                attributeDisplayForm={attributeDisplayForm}
                metadata={md}
                {...dropdownProps}
                selection={this.getSelection()}
                isInverted={this.isInverted()}
                isUsingIdentifier={isUsingIdentifier}
            />
        );
    }
}
