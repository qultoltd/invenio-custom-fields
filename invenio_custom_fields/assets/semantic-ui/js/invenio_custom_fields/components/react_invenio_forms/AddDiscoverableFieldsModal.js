import React, { useState } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import ListAndFilterCustomFields from "./ListAndFilterCustomFields";

const AddDiscoverableFieldsModal = ({ sections, onSave }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState();
  const [loading, setLoading] = useState(false);

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClosed = () => {
    setModalOpen(false);
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  const handleAddSection = async () => {
    setLoading(true);

    if (selectedSection) {
      onSave(selectedSection);
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedSection(null);
    setLoading(false);
    handleModalClosed();
  };

  return (
    <>
      <Button className="labeled" icon fluid onClick={handleModalOpen}>
        <Icon name="plus" />
        {i18next.t("Add section")}
      </Button>

      <Modal open={modalOpen}>
        <Modal.Header>{i18next.t("Add section")}</Modal.Header>

        <ListAndFilterCustomFields
          onSelectSection={handleSelectSection}
          sections={sections || []}
        />

        <Modal.Actions>
          <Button
            icon
            onClick={handleClose}
            floated="left"
            labelPosition="left"
          >
            <Icon name="cancel" />
            {i18next.t("Close")}
          </Button>

          <Button
            icon
            labelPosition="left"
            onClick={handleAddSection}
            disabled={loading || !selectedSection}
            loading={loading}
          >
            <Icon name="plus" />
            {i18next.t("Add section")}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default AddDiscoverableFieldsModal;
