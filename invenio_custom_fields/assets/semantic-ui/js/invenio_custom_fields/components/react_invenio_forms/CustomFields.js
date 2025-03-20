import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import _ from "lodash";
import { useFormikContext } from "formik";
import { loadWidgetsFromConfig } from "react-invenio-forms";
import { Container, Divider } from "semantic-ui-react";
import AccordionField from "./AccordionField";
import AddDiscoverableFieldsModal from "./AddDiscoverableFieldsModal";

const CustomFields = ({
  record,
  templateLoaders,
  includesPaths,
  fieldPathPrefix,
  config,
}) => {
  const [sections, setSections] = useState();
  const [newSection, setNewSection] = useState();
  const [discoverFieldsSections, setDiscoverFieldsSections] = useState();
  const [discoverableSectionsOrder, setDiscoverableSectionsOrder] = useState();

  const formikProps = useFormikContext();

  const filledRecordCustomFields = useMemo(() => {
    let filledFields = [];

    if (record && !_.isEmpty(record.custom_fields)) {
      filledFields = Object.keys(record.custom_fields).map(
        (key) => `custom_fields.${key}`
      );
    }

    return filledFields;
  }, [record]);

  useEffect(() => {
    populateConfig();
  }, []);

  useLayoutEffect(() => {
    if (newSection) {
      const element = document.getElementById(newSection);
      element.scrollIntoView({ behavior: "smooth" });
      setNewSection(null);
    }
  }, [newSection]);

  const hasValue = (section) =>
    section.fields.some((item) => filledRecordCustomFields.includes(item.key));

  const populateConfig = async () => {
    try {
      const { sectionsConfig, discoverFieldsConfig } =
        await loadCustomFieldsWidgets();

      const sections = sectionsConfig.map((sectionCfg) => {
        const paths = includesPaths(sectionCfg.fields, fieldPathPrefix);
        return { ...sectionCfg, paths };
      });

      const discoverFieldsSections = discoverFieldsConfig.map((sectionCfg) => {
        const paths = includesPaths(sectionCfg.fields, fieldPathPrefix);
        return { ...sectionCfg, paths };
      });

      const existingDiscoverFieldsSections = discoverFieldsSections?.filter(
        (section) => hasValue(section)
      );

      const displayableSections = [
        ...sections,
        ...existingDiscoverFieldsSections,
      ];

      const displayableDiscoverSections = _.xorBy(
        discoverFieldsSections,
        existingDiscoverFieldsSections,
        "section"
      );

      setSections(displayableSections);
      setDiscoverFieldsSections(displayableDiscoverSections);
      setDiscoverableSectionsOrder(
        discoverFieldsSections.reduce((result, current, index) => {
          result[current.section] = index;
          return result;
        }, {})
      );
    } catch (error) {
      console.error("Couldn't load custom fields widgets.", error);
    }
  };

  const handleAddSection = (newSection) => {
    setSections((prevState) => {
      const { simple, discoverable } = prevState.reduce(
        (result, current) => {
          if (current.discoverable_fields) {
            result.discoverable.push(current);
          } else {
            result.simple.push(current);
          }
          return result;
        },
        { simple: [], discoverable: [] }
      );

      discoverable.push(newSection);
      discoverable.sort(compareDiscoverableSections);
      return [...simple, ...discoverable];
    });
    setDiscoverFieldsSections((prevState) =>
      prevState.filter((item) => item.section !== newSection.section)
    );
    setNewSection(newSection.section);
  };

  const handleDeleteSection = (event, sectionTitle) => {
    event.preventDefault();
    event.stopPropagation();
    const index = sections.findIndex((item) => item.section === sectionTitle);

    const updatedSections = [...sections];
    const updatedDiscoverFieldsSections = [...discoverFieldsSections];

    if (index !== -1) {
      const [section] = updatedSections.splice(index, 1);

      section.fields.forEach((field) => {
        formikProps.setFieldValue(field.key, "");
      });

      updatedDiscoverFieldsSections.push(section);
      updatedDiscoverFieldsSections.sort(compareDiscoverableSections);
    }

    setSections(updatedSections);
    setDiscoverFieldsSections(updatedDiscoverFieldsSections);
  };

  const compareDiscoverableSections = (a, b) =>
    discoverableSectionsOrder[a.section] - discoverableSectionsOrder[b.section];

  const loadCustomFieldsWidgets = async () => {
    const sections = [];
    const discoverFieldsSections = []; // finds sections with discoverable fields
    for (const sectionCfg of config) {
      // Path to end user's folder defining custom fields ui widgets
      const fields = await loadWidgetsFromConfig({
        templateLoaders: templateLoaders,
        fieldPathPrefix: fieldPathPrefix,
        fields: sectionCfg.fields,
        record: record,
      });

      if (sectionCfg.discoverable_fields) {
        discoverFieldsSections.push({
          ...sectionCfg,
          fields: fields,
          fieldsConfig: sectionCfg.fields,
        });
      } else {
        sections.push({ ...sectionCfg, fields });
      }
    }

    return {
      sectionsConfig: sections,
      discoverFieldsConfig: discoverFieldsSections,
    };
  };

  return (
    <>
      {sections &&
        sections.map(
          ({
            fields,
            paths,
            displaySection = true,
            section: sectionName,
            discoverable_fields,
          }) =>
            displaySection ? (
              <AccordionField
                id={sectionName}
                key={`section-${sectionName}`}
                includesPaths={paths}
                label={sectionName}
                active
                deletable={discoverable_fields}
                onDeleteSection={handleDeleteSection}
              >
                {fields}
              </AccordionField>
            ) : (
              <Container key="custom-fields-section">{fields}</Container>
            )
        )}

      {discoverFieldsSections?.length > 0 && (
        <>
          <Divider fitted className="rel-mb-1" />
          <AddDiscoverableFieldsModal
            onSave={handleAddSection}
            sections={discoverFieldsSections}
          />
        </>
      )}
    </>
  );
};

CustomFields.defaultProps = {
  includesPaths: (fields) => fields.map((field) => field.key),
};

export default CustomFields;
