import React, { useEffect } from "react";
import { IconButton, Menu } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { makeStyles } from "tss-react/mui";
import { MuiColorInput, MuiColorInputValue } from "mui-color-input";

import Mark from "mark.js";

import { dom } from "@utils";

import { DEFAULT_MARK_COLOR } from "@config/constants";

interface IMarkMenuProps {
  selectedMark?: { id: string; index: string } | null;
  articleDiv: HTMLDivElement | null;
  markJs?: Mark | null;
  onClose: () => void;
}

const useStyles = makeStyles()((theme) => ({
  menuList: {
    display: "flex",
    justifyContent: "center",
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
}));

const MarkMenu = ({
  selectedMark,
  articleDiv,
  markJs,
  onClose,
}: IMarkMenuProps) => {
  // Styles
  const { classes } = useStyles();
  const selectedMarkElement =
    selectedMark && articleDiv
      ? dom.getMarkElementByIdAndIndex(
          articleDiv,
          selectedMark.id,
          selectedMark.index
        )
      : null;
  const open = !!selectedMarkElement;
  const [color, setColor] =
    React.useState<MuiColorInputValue>(DEFAULT_MARK_COLOR);

  const onDeleteClick = async () => {
    if (markJs && selectedMark) {
      await dom.unmark(markJs, [{ id: selectedMark.id }]);
    }
    onClose();
  };

  const onColorChange = (color: MuiColorInputValue) => {
    setColor(color);
    if (selectedMark) {
      dom.setMarkColor(articleDiv, selectedMark.id, color.toString());
    }
  };

  useEffect(() => {
    if (selectedMarkElement) {
      setColor(
        (selectedMarkElement as HTMLElement).style.textDecorationColor ||
          DEFAULT_MARK_COLOR
      );
    }
  }, [selectedMarkElement]);

  return (
    <div>
      <Menu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={selectedMarkElement}
        open={open}
        onClose={onClose}
        classes={{
          list: classes.menuList,
        }}
      >
        <MuiColorInput value={color} onChange={onColorChange} size={"small"} />
        <IconButton color="error" onClick={onDeleteClick}>
          <DeleteIcon />
        </IconButton>
      </Menu>
    </div>
  );
};

export default MarkMenu;
