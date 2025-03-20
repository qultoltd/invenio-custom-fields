import React, { Component, useState } from "react";
import { Field, FastField } from "formik";
import { Accordion, Button, Container, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _omit from "lodash/omit";
import _get from "lodash/get";

class AccordionField extends Component {
  hasError(errors, initialValues = undefined, values = undefined) {
    const { includesPaths } = this.props;
    for (const errorPath in errors) {
      for (const subPath in errors[errorPath]) {
        const path = `${errorPath}.${subPath}`;
        if (
          _get(initialValues, path, "") === _get(values, path, "") &&
          includesPaths.includes(`${errorPath}.${subPath}`)
        )
          return true;
      }
    }
    return false;
  }

  renderAccordion = (props) => {
    const {
      form: { errors, status, initialErrors, initialValues, values },
    } = props;

    // eslint-disable-next-line no-unused-vars
    const { label, children, active, deletable, onDeleteSection, ...ui } =
      this.props;
    const uiProps = _omit({ ...ui }, ["optimized", "includesPaths"]);
    const hasError = status
      ? this.hasError(status)
      : this.hasError(errors) ||
        this.hasError(initialErrors, initialValues, values);
    const panels = [
      {
        key: `panel-${label}`,
        title: {
          content: label,
        },
        content: {
          content: <Container>{children}</Container>,
        },
      },
    ];

    const errorClass = hasError ? "error secondary" : "";
    const [activeIndex, setActiveIndex] = useState(active ? 0 : -1);

    const handleTitleClick = (e, { index }) => {
      setActiveIndex(activeIndex === index ? -1 : index);
    };

    return (
      <Accordion
        inverted
        className={`invenio-accordion-field ${errorClass}`}
        {...uiProps}
      >
        {panels.map((panel, index) => (
          <React.Fragment key={panel.key}>
            <Accordion.Title
              active={activeIndex === index}
              index={index}
              onClick={handleTitleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleTitleClick(e, { index });
                }
              }}
              tabIndex={0}
            >
              {panel.title.content}
              {deletable && (
                <Button
                  className="ml-10"
                  onClick={(event) => {
                    onDeleteSection(event, panel.title.content);
                  }}
                  content={i18next.t("Delete section")}
                />
              )}
              <Icon name="angle right" />
            </Accordion.Title>
            <Accordion.Content active={activeIndex === index}>
              {panel.content.content}
            </Accordion.Content>
          </React.Fragment>
        ))}
      </Accordion>
    );
  };

  render() {
    const { optimized } = this.props;

    const FormikField = optimized ? FastField : Field;
    return <FormikField name="" component={this.renderAccordion} />;
  }
}

AccordionField.defaultProps = {
  active: true,
  includesPaths: [],
  label: "",
  optimized: false,
  children: null,
  ui: null,
};

export default AccordionField;
