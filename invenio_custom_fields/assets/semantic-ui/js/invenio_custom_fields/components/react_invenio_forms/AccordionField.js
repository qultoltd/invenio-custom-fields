import React, { useState } from "react";
import { Field, FastField } from "formik";
import { Accordion, Button, Container, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _omit from "lodash/omit";
import _get from "lodash/get";

const AccordionField = ({
  includesPaths = [],
  optimized,
  label = "",
  children,
  active = true,
  deletable,
  onDeleteSection,
  ...uiProps
}) => {
  const [activeIndex, setActiveIndex] = useState(active ? 0 : -1);

  const hasError = (errors, initialValues = undefined, values = undefined) => {
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
  };

  const handleTitleClick = (e, { index }) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  const handleKeyDownTitleClick = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      handleTitleClick(e, { index });
    }
  };

  const renderAccordion = ({
    form: { errors, status, initialErrors, initialValues, values },
  }) => {
    const accordionHasError = status
      ? hasError(status)
      : hasError(errors) || hasError(initialErrors, initialValues, values);

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

    const errorClass = accordionHasError ? "error secondary" : "";

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
              onKeyDown={(e) => handleKeyDownTitleClick(e, index)}
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

  const FormikField = optimized ? FastField : Field;
  return <FormikField name="" component={renderAccordion} />;
};

export default AccordionField;
