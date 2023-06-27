import csv
import json
import re


def convert_csv_to_json(csv_path, json_path, header_mapping):
    with open(csv_path, "r", encoding="UTF-8") as csv_file:
        reader = csv.DictReader(csv_file)
        data = [dict(row) for row in reader]

    renamed_data = [
        {header_mapping.get(key, key): value for key, value in row.items()}
        for row in data
    ]

    with open(json_path, "w", encoding="UTF-8") as json_file:
        json.dump(renamed_data, json_file, indent=4)


def clean_array(array, filter_list):
    return [
        element.strip(";:,")
        for element in array
        if element.strip(";:,").lower() not in [item.lower() for item in filter_list]
    ]


def is_link_or_email(element):
    if element.startswith(("http://", "https://", "www.")):
        return True

    if "@" in element and "." in element:
        return True

    if ".pl" in element or ".com" in element:
        return True

    return False


def filter_links_and_emails(array):
    return [element for element in array if is_link_or_email(element)]


def parse_links(json_array):
    parsed_data = {}

    for link in json_array:
        if "facebook" in link and "facebook" not in parsed_data:
            parsed_data["facebook"] = link
        elif "instagram" in link and "instagram" not in parsed_data:
            parsed_data["instagram"] = link
        elif "linkedin" in link and "linkedin" not in parsed_data:
            parsed_data["linkedin"] = link
        elif "twitter" in link and "twitter" not in parsed_data:
            parsed_data["twitter"] = link
        elif "youtube" in link and "youtube" not in parsed_data:
            parsed_data["youtube"] = link
        elif "@" in link:
            continue
        elif link.startswith(("http://", "https://")) or ".pl" in link:
            if "website" not in parsed_data:
                parsed_data["website"] = link
        else:
            if "other" in parsed_data:
                if not isinstance(parsed_data["other"], list):
                    parsed_data["other"] = [parsed_data["other"]]
                parsed_data["other"].append(link)
            else:
                parsed_data["other"] = link

    return parsed_data


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

    with open(json_path, "r") as json_file:
        data = json.load(json_file)

    all_tags = []
    for row in data:
        links = clean_array(row["photos"].split(";"), filter_list)
        row["photos"] = links

        tags = clean_array(re.split(" |,", row["tags"]), filter_list)
        row["tags"] = tags
        all_tags += tags

        contacts = clean_array(row["contact"].split(" "), filter_list)
        row["contact"] = parse_links(filter_links_and_emails(contacts))

    with open(json_path, "w") as json_file:
        json.dump(data, json_file, indent=4)


def main():
    csv_file_path = "organisation-data.csv"
    json_file_path = "seed_new.json"
    json_path_tags = "form_responses_tags_v2.json"
    header_mapping = {
        "Sygnatura czasowa": "time_signature",
        "Ogólny adres e-mail uczelnianej organizacji studenckiej": "email",
        "Nazwa uczelnianej organizacji studenckiej:": "name",
        "Status prawny uczelnianej organizacji studenckiej:": "type",
        "Dziedzina nauki, która obejmuje działalność uczelnianej organizacji studenckiej": "field",
        "Logo:": "logoUrl",
        "Słowa kluczowe (tagi) charakteryzujące działalność uczelnianej organizacji studenckiej:": "tags",
        "Ogólny opis działalności:": "shortDescription",
        "Szczegółowy opis działalności:": "longDescription",
        "Zdobywane umiejętności, wyzwania, przed którymi są stawiani członkowie zespołu:": "skillsAndChallenges",
        "Największe sukcesy, dokonania, osiągnięcia którymi może się pochwalić uczelniana organizacja studencka na przestrzeni ostatnich kilku lat (w tym szczególnie sukcesy ponadczasowe):": "achievements",
        "Wyróżniamy się tym, że...": "distinguishingFeatures",
        "Obszary zainteresowań studentów, którzy mogą dołączyć do uczelnianej organizacji studenckiej:": "areasOfInterest",
        "Zdjęcia przedstawiające działalność uczelnianej organizacji studenckiej:": "photos",
        "Dane kontaktowe: adres e-mail, strona internetowa, media społecznościowe, Linkedin:": "contact",
    }
    convert_csv_to_json(csv_file_path, json_file_path, header_mapping)
    parse_json_file(json_file_path, json_path_tags)


if __name__ == "__main__":
    main()
