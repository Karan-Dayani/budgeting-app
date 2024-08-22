import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  Fontisto,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";

export const icons = {
  index: (props) => <Entypo name="home" size={24} {...props} />,
  Expenses: (props) => <FontAwesome name="dollar" size={26} {...props} />,
  Goals: (props) => <AntDesign name="checkcircleo" size={24} {...props} />,
};
