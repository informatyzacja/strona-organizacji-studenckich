import csv
import json
import re



def convert_csv_to_json(csv_path, json_path, header_mapping):
    with open(csv_path, "r", encoding="UTF-8") as csv_file:
        reader = csv.DictReader(csv_file)
        data = list(reader)

    renamed_data = []
    for row in data:
        renamed_row = {
            header_mapping.get(key, key): value for key, value in row.items()
        }
        renamed_data.append(renamed_row)

    with open(json_path, "w", encoding="UTF-8") as json_file:
        json.dump(renamed_data, json_file, indent=4)


def parse_json_file(json_path, json_path_tags):
    filter_list = [
        "",
        "-",
        "|",
        "Adres",
        "e-mail",
        "mail",
        "email",
        "Strona",
        "internetowa",
        "Facebook",
        "fb",
        "Instagram",
        "linkedin",
        "strona",
        "Kontakt",
        "mailowy",
        "Spotify",
    ]

    def clean_array(array):
        return [
            element.strip(";:,").lower()
            for element in array
            if element.strip(";:,").lower()
            not in [item.lower() for item in filter_list]
        ]

    def is_link_or_email(element):
        # return True
        if (
            element.startswith("http://")
            or element.startswith("https://")
            or element.startswith("www.")
        ):
            return True

        if "@" in element and "." in element:
            return True

        if ".pl" in element:
            return True

        if ".com" in element:
            return True

        print(element)
        return False

    def filter_links_and_emails(array):
        return [element for element in array if is_link_or_email(element)]

    def parse_links(json_array):
        parsed_data = {}

        for link in json_array:
            if "facebook" in link:
                if "facebook" in parsed_data:
                    continue
                    if not isinstance(parsed_data["facebook"], list):
                        parsed_data["facebook"] = [parsed_data["facebook"]]
                    parsed_data["facebook"].append(link)
                else:
                    parsed_data["facebook"] = link
            elif "instagram" in link:
                if "instagram" in parsed_data:
                    continue
                    if not isinstance(parsed_data["instagram"], list):
                        parsed_data["instagram"] = [parsed_data["instagram"]]
                    parsed_data["instagram"].append(link)
                else:
                    parsed_data["instagram"] = link
            elif "linkedin" in link:
                if "linkedin" in parsed_data:
                    continue
                    # if not isinstance(parsed_data["linkedin"], list):
                    #     parsed_data["linkedin"] = [parsed_data["linkedin"]]
                    # parsed_data["linkedin"].append(link)
                else:
                    parsed_data["linkedin"] = link
            elif "twitter" in link:
                if "twitter" in parsed_data:
                    continue
                    if not isinstance(parsed_data["twitter"], list):
                        parsed_data["twitter"] = [parsed_data["twitter"]]
                    parsed_data["twitter"].append(link)
                else:
                    parsed_data["twitter"] = link
            elif "@" in link:
                continue
                if "email" in parsed_data:
                    if not isinstance(parsed_data["email"], list):
                        parsed_data["email"] = [parsed_data["email"]]
                    parsed_data["email"].append(link)
                else:
                    parsed_data["email"] = link
            elif link.startswith("http://") or link.startswith("https://"):
                if "website" in parsed_data:
                    continue
                    if not isinstance(parsed_data["website"], list):
                        parsed_data["website"] = [parsed_data["website"]]
                    parsed_data["website"].append(link)
                else:
                    parsed_data["website"] = link
            else:
                if "other" in parsed_data:
                    continue
                    if not isinstance(parsed_data["other"], list):
                        parsed_data["other"] = [parsed_data["other"]]
                    parsed_data["other"].append(link)
                else:
                    parsed_data["other"] = link

        return parsed_data

    with open(json_path, "r") as json_file:
        data = json.load(json_file)

    all_tags = []
    # Parse penultimate line as multiple links
    for i, row in enumerate(data):
        links = row["photos"].split(";")
        data[i]["photos"] = clean_array(links)

        tags = re.split(" |,", row["tags"])
        data[i]["tags"] = clean_array(tags)
        all_tags += data[i]["tags"]

        contacts = row["contact"].split(" ")
        contacts = clean_array(contacts)
        # filter_links_and_emails(contacts)
        data[i]["contact"] = parse_links(filter_links_and_emails(contacts))

        #
        # print(contacts)

    # penultimate_line = data[-2]['photos']
    # print(penultimate_line)
    # split_links = penultimate_line.split(';')
    # data[-1]['Links'] = split_links

    # # Parse last line by splitting on spaces
    # last_line = data[-1]
    # split_values = last_line['Last Line'].split()
    # for i, header in enumerate(header_mapping.values()):
    #     last_line[header] = split_values[i]

    # Write the modified data back to the JSON file
    with open(json_path, "w") as json_file:
        json.dump(data, json_file, indent=4)

    with open(json_path_tags, "w") as json_file:
        json.dump(all_tags, json_file, indent=4)

    with open(json_path_tags + ".txt", "w") as txt_file:
        for line in all_tags:
            txt_file.write("".join(line) + "\n")  #


def main():
    csv_file_path = "organisation-data.csv"
    json_file_path = "seed_new.json"
    json_path_tags = "form_responses_tags_v2.json"
    header_mapping = {
        "Sygnatura czasowa": "time_signature",
        "Og\u00f3lny adres e-mail uczelnianej organizacji studenckiej": "email",
        "Nazwa uczelnianej organizacji studenckiej:": "name",
        "Status prawny uczelnianej organizacji studenckiej:": "type",
        "Dziedzina nauki, kt\u00f3ra obejmuje dzia\u0142alno\u015b\u0107 uczelnianej organizacji studenckiej": "field",
        "Logo:": "logoUrl",
        "S\u0142owa kluczowe (tagi) charakteryzuj\u0105ce dzia\u0142alno\u015b\u0107 uczelnianej organizacji studenckiej:": "tags",
        "Og\u00f3lny opis dzia\u0142alno\u015bci:": "shortDescription",
        "Szczeg\u00f3\u0142owy opis dzia\u0142alno\u015bci:": "longDescription",
        "Zdobywane umiej\u0119tno\u015bci, wyzwania, przed kt\u00f3rymi s\u0105 stawiani cz\u0142onkowie zespo\u0142u:": "skillsAndChallenges",
        "Najwi\u0119ksze sukcesy, dokonania, osi\u0105gni\u0119cia kt\u00f3rymi mo\u017ce si\u0119 pochwali\u0107 uczelniana organizacja studencka na przestrzeni ostatnich kilku lat (w tym szczeg\u00f3lnie sukcesy ponadczasowe):": "achievements",
        "Wyr\u00f3\u017cniamy si\u0119 tym, \u017ce...": "distinguishingFeatures",
        "Obszary zainteresowa\u0144 student\u00f3w, kt\u00f3rzy mog\u0105 do\u0142\u0105czy\u0107 do uczelnianej organizacji studenckiej:": "areasOfInterest",
        "Zdj\u0119cia przedstawiaj\u0105ce dzia\u0142alno\u015b\u0107 uczelnianej organizacji studenckiej:": "photos",
        "Dane kontaktowe: adres e-mail, strona internetowa, media spo\u0142eczno\u015bciowe, Linkedin:": "contact",
    }
    convert_csv_to_json(csv_file_path, json_file_path, header_mapping)
    parse_json_file(json_file_path, json_path_tags)


if __name__ == "__main__":
    main()
