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
  Home: (props) => <Entypo name="home" size={24} {...props} />,
  Expenses: (props) => <FontAwesome name="rupee" size={24} {...props} />,
  Goals: (props) => <AntDesign name="checkcircleo" size={24} {...props} />,
  Profile: (props) => <FontAwesome name="user-circle-o" size={24} {...props} />,
};
