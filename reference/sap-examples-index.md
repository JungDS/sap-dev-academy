# SAP 공식 ABAP 예제 — 참조 인덱스 (8.16)

> 🗓️ 자동 생성. **출처 = SAP ABAP Keyword Documentation 8.16 (ABENABAP_EXAMPLES).**
> ⚠️ **여기엔 예제 '이름·제목·링크'만** 둔다(인용/점프용 카탈로그). SAP 예제 **소스코드는 저작물**이라 본 공개 repo에 복사하지 않는다 — 실제 코드는 링크를 따라가거나 사내 SAP 시스템에서 확인할 것.
> 총 639개 예제. URL 형식: `https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/<object>.html`

## 우리 챕터 ↔ SAP 토픽 빠른 매핑

- **CH03/07** ← DDIC
- **CH04** ← Convert Time Stamp in Time Stamp Field · Convert Time Stamps in Packed Numbers · Evaluating Date Fields and Time Fields · Find a PCRE Regular Expression · Read Time Stamp from String · Rounding Time Stamps in Packed Numbers · Runtime Measurement of Database Reads · UPDATE · string_exp · string_func · string_tmpl
- **CH05** ← CL_ABAP_CORRESPONDING for Nested Structures · CL_ABAP_CORRESPONDING for Simple Structures · Component Operator for Structures · Conversion Rules for Structures · Creating a Structure Using RTTC · Declaration of a Nested Structure · Declaration of a Simple Structure · Deriving LOB Handle Structures · Filling a Structure · MOVE-CORRESPONDING for Structures · Structure from ABAP Dictionary · Using TYPE TABLE/TYPE STRUCTURE FOR HIERARCHY · Variants of MOVE-CORRESPONDING and the CORRESPONDING Operator Using Deep Structures
- **CH06** ← CL_ABAP_CORRESPONDING for Internal Tables · Comparing Internal Tables · Component Operator for Internal Tables · Inverse Reads on Internal Table without STEP · MOVE-CORRESPONDING for Internal Tables · Sorting Internal Tables · Sorting Internal Tables Alphabetically · Sorting Internal Tables Dynamically · Sorting Internal Tables with Secondary Keys · itab
- **CH08/13** ← SELECT · Selection Screens · Selection Screens -Pushbuttons in the Toolbar · Selection Screens -Subscreens · Selection Screens -Tabstrips
- **CH08/13/19** ← ABAP SQL · ABAP SQL Engine · ABAP SQL Statements with the Addition MAPPING FROM ENTITY
- **CH15** ← Messages
- **CH16** ← dynpro
- **CH20** ← ABAP Objects · Case Distinction CASE TYPE OF for Exceptions · Converting a Classic Exception to a Class-Based Exception · Converting the Exception error_message to a Class-Based Exception · Creating Data Objects with Implicit Type · Creating Elementary Data Objects · Creating Structured Data Objects · Creating Tabular Data Objects · Creating a Data Object as a Shared Object · Creating an Instance of a Class as a Shared Object · Deep Data Objects · Determining Data Object Distances · Determining Object Types · Exceptions · Shared Objects
- **CH22** ← ABAP CDS · CDS DDIC-based views (obsolete) · CDS DDL · CDS TDL · Client-Dependent CDS Table Functions · Client-Independent CDS Table Functions
- **CH23** ← ABAP EML · ABAP EML in Use: Managed RAP BO with External Numbering · ABAP EML in Use: Unmanaged RAP BO with External Numbering · Checking RAP Transactional Phases · Example for RAP Handler Methods · Example for RAP Saver Method map_messages · Example for RAP Saver Methods · Example for RAP Saver Methods (Late Numbering Scenario) · Example for save_modified in a Managed RAP BO with Additional Save · Example for save_modified in a Managed RAP BO with Unmanaged Save · Getting RAP Context Information Using CL_ABAP_BEHV_AUX · Local Consumption of RAP Business Events · RAP · RAP Calculator: Managed · RAP Messages: Transition and State Messages · Transactional Phases in a RAP Transaction · Using the Addition PRIVILEGED with an ABAP EML Statement
- **CH25** ← SAP Locks
- **CH30** ← RFC
- **CH33** ← ADBC · AMDP

## 토픽 그룹별 예제


### itab  _(≈CH06, 53)_

- [itab - Appending Lines](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenappend_lines_abexa.html) — `abenappend_lines_abexa`
- [itab - Using CL_ABAP_DIFF](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_diff_abexa.html) — `abencl_abap_diff_abexa`
- [itab - Deleting Duplicate Lines](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendelete_dup_lines_abexa.html) — `abendelete_dup_lines_abexa`
- [itab - Deleting Lines Using WHERE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendelete_itab_using_key_abexa.html) — `abendelete_itab_using_key_abexa`
- [itab - Deleting Lines Using the Index](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendelete_line_idx_abexa.html) — `abendelete_line_idx_abexa`
- [itab - Grouping with FOR for Aggregates](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_aggregates_abexa.html) — `abenfor_group_by_aggregates_abexa`
- [itab - Grouping with FOR Using a Comparison](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_comparison_abexa.html) — `abenfor_group_by_comparison_abexa`
- [itab - Grouping with FOR Using a Function](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_func_abexa.html) — `abenfor_group_by_func_abexa`
- [itab - Grouping with FOR in Group Levels](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_levels_abexa.html) — `abenfor_group_by_levels_abexa`
- [itab - Grouping with FOR, Nesting](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_lvls_nst_abexa.html) — `abenfor_group_by_lvls_nst_abexa`
- [itab - Grouping with FOR Using a Method](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_method_abexa.html) — `abenfor_group_by_method_abexa`
- [itab - Grouping with FOR in Overlaps](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_overlap_abexa.html) — `abenfor_group_by_overlap_abexa`
- [itab - Grouping with FOR in Packages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_packages_abexa.html) — `abenfor_group_by_packages_abexa`
- [itab - Grouping with FOR for Sorts](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_sort_abexa.html) — `abenfor_group_by_sort_abexa`
- [itab - Grouping with FOR Using Column Values](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfor_group_by_values_abexa.html) — `abenfor_group_by_values_abexa`
- [itab - Insert Lines](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninsert_lines_abexa.html) — `abeninsert_lines_abexa`
- [itab - Grouping with LOOP, Output Behavior](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_at_group_abexa.html) — `abenloop_at_group_abexa`
- [itab - Loop with Key](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_at_itab_key_abexa.html) — `abenloop_at_itab_key_abexa`
- [itab - Loop with Step Size](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_at_itab_step_abexa.html) — `abenloop_at_itab_step_abexa`
- [itab - Grouping Internal Tables, Step by Step](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_abexa.html) — `abenloop_group_by_abexa`
- [itab - Grouping with LOOP for Aggregates](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_aggregates_abexa.html) — `abenloop_group_by_aggregates_abexa`
- [itab - Grouping with LOOP Using a Comparison](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_comparison_abexa.html) — `abenloop_group_by_comparison_abexa`
- [itab - Grouping with LOOP, Explicit and Implicit](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_explicit_abexa.html) — `abenloop_group_by_explicit_abexa`
- [itab - Grouping with LOOP and FOR](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_for_abexa.html) — `abenloop_group_by_for_abexa`
- [itab - Grouping with LOOP Using a Function](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_func_abexa.html) — `abenloop_group_by_func_abexa`
- [itab - Grouping with LOOP in Group Levels](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_levels_abexa.html) — `abenloop_group_by_levels_abexa`
- [itab - Grouping with LOOP, Nesting](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_lvls_nst_abexa.html) — `abenloop_group_by_lvls_nst_abexa`
- [itab - Grouping with LOOP Using a Method](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_method_abexa.html) — `abenloop_group_by_method_abexa`
- [itab - Grouping with LOOP in Overlaps](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_overlap_abexa.html) — `abenloop_group_by_overlap_abexa`
- [itab - Grouping with LOOP in Packages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_packages_abexa.html) — `abenloop_group_by_packages_abexa`
- [itab - Random Grouping with LOOP](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_random_abexa.html) — `abenloop_group_by_random_abexa`
- [itab - Grouping with LOOP and Sort](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_sort_abexa.html) — `abenloop_group_by_sort_abexa`
- [itab - Grouping with LOOP Using Column Values](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_group_by_values_abexa.html) — `abenloop_group_by_values_abexa`
- [itab - STEP Examples](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenloop_step_examples_abexa.html) — `abenloop_step_examples_abexa`
- [itab - Index Access with Key](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmodify_itab_using_key_abexa.html) — `abenmodify_itab_using_key_abexa`
- [itab - Nested Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abennested_internal_tables_abexa.html) — `abennested_internal_tables_abexa`
- [itab - Key Accesses](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenread_itab_using_key_abexa.html) — `abenread_itab_using_key_abexa`
- [itab - Output Area](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenread_table_abexa.html) — `abenread_table_abexa`
- [itab - Multiple FOR Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreduce_for_for_abexa.html) — `abenreduce_for_for_abexa`
- [itab - Table Reduction, Method Calls](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreduce_method_call_abexa.html) — `abenreduce_method_call_abexa`
- [itab - Table Reduction, Summation of an Array](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreduce_simple_abexa.html) — `abenreduce_simple_abexa`
- [itab - Table Reductions, Structured Result](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreduce_structured_abexa.html) — `abenreduce_structured_abexa`
- [itab - Table Reduction, String Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreduce_text_abexa.html) — `abenreduce_text_abexa`
- [itab - Table Comprehensions, Multiple FOR Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_cmprhnsns_for_for_abexa.html) — `abentable_cmprhnsns_for_for_abexa`
- [itab - Table Comprehensions, Join](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_cmprhnsns_join_abexa.html) — `abentable_cmprhnsns_join_abexa`
- [itab - Table Comprehensions, Multiple Lines](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_cmprhnsns_lines_abexa.html) — `abentable_cmprhnsns_lines_abexa`
- [itab - Table Comprehensions, Local Helper Fields](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_cmprhnsns_locals_abexa.html) — `abentable_cmprhnsns_locals_abexa`
- [itab - Table Comprehensions, Basic Properties](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_cmprhnsns_simple_abexa.html) — `abentable_cmprhnsns_simple_abexa`
- [itab - Table Comprehensions, Use of Step Size](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_cmprhnsns_step_abexa.html) — `abentable_cmprhnsns_step_abexa`
- [itab - Virtual Sort of Two Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvirtual_sort_combined_abexa.html) — `abenvirtual_sort_combined_abexa`
- [itab - Virtual Sort with Filter Specified](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvirtual_sort_filter_abexa.html) — `abenvirtual_sort_filter_abexa`
- [itab - Virtual Sort of Flight Data](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvirtual_sort_flights_abexa.html) — `abenvirtual_sort_flights_abexa`
- [itab - Virtual Sort of a Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvirtual_sort_simple_abexa.html) — `abenvirtual_sort_simple_abexa`

### dynpro  _(≈CH16, 40)_

- [dynpro - Unconditional Module Call](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_at_exit_comm_abexa.html) — `abendynpro_at_exit_comm_abexa`
- [dynpro - Automatic Input Checks](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_auto_check_abexa.html) — `abendynpro_auto_check_abexa`
- [dynpro - CFW](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_cfw_abexa.html) — `abendynpro_cfw_abexa`
- [dynpro - Obsolete Input Check Using SELECT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_check_flow_abexa.html) — `abendynpro_check_flow_abexa`
- [dynpro - Context Menus](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_context_menu_abexa.html) — `abendynpro_context_menu_abexa`
- [dynpro - CFW Events](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_custom_control_abexa.html) — `abendynpro_custom_control_abexa`
- [dynpro - Fields with Dictionary Reference](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_dict_abexa.html) — `abendynpro_dict_abexa`
- [dynpro - List Box with Value List from Input Help](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_drop1_abexa.html) — `abendynpro_drop1_abexa`
- [dynpro - List Box with Value List from PBO Module](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_drop2_abexa.html) — `abendynpro_drop2_abexa`
- [dynpro - Field Help](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_f1_help_abexa.html) — `abendynpro_f1_help_abexa`
- [dynpro - Input Help in Dialog Modules](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_f4_help_dial_abexa.html) — `abendynpro_f4_help_dial_abexa`
- [dynpro - Input Helps in the ABAP Dictionary](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_f4_help_dic_abexa.html) — `abendynpro_f4_help_dic_abexa`
- [dynpro - Obsolete Input Help Using SELECT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_f4_help_dyn_abexa.html) — `abendynpro_f4_help_dyn_abexa`
- [dynpro - FIELD Statement](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_field_abexa.html) — `abendynpro_field_abexa`
- [dynpro - Input Checks in Dialog Modules](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_field_chain_abexa.html) — `abendynpro_field_chain_abexa`
- [dynpro - Dynpro Sequences](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_flow_abexa.html) — `abendynpro_flow_abexa`
- [dynpro - Determining the Cursor Position](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_get_cursor_abexa.html) — `abendynpro_get_cursor_abexa`
- [dynpro - GUI Statuses and Function Codes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_gui_status_abexa.html) — `abendynpro_gui_status_abexa`
- [dynpro - Holding Data](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_hold_data_abexa.html) — `abendynpro_hold_data_abexa`
- [dynpro - Processing Input and Output Fields](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_in_out_field_abexa.html) — `abendynpro_in_out_field_abexa`
- [dynpro - Dynamic Screen Modification](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_mod_simple_abexa.html) — `abendynpro_mod_simple_abexa`
- [dynpro - Conditional Module Call](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_on_cond_abexa.html) — `abendynpro_on_cond_abexa`
- [dynpro - Pushbuttons](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_push_button_abexa.html) — `abendynpro_push_button_abexa`
- [dynpro - Checkboxes and Radio Buttons](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_radio_button_abexa.html) — `abendynpro_radio_button_abexa`
- [dynpro - Defining the Cursor Position](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_set_cursor_abexa.html) — `abendynpro_set_cursor_abexa`
- [dynpro - Simple Module Call](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_simple_module_abexa.html) — `abendynpro_simple_module_abexa`
- [dynpro - Splitter Control](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_splitter_control_abexa.html) — `abendynpro_splitter_control_abexa`
- [dynpro - Status Icons](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_status_icons_abexa.html) — `abendynpro_status_icons_abexa`
- [dynpro - Strings](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_strings_abexa.html) — `abendynpro_strings_abexa`
- [dynpro - Subscreens](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynpro_subscreen_abexa.html) — `abendynpro_subscreen_abexa`
- [dynpro - HTML Browser](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhtml_browser_abexa.html) — `abenhtml_browser_abexa`
- [dynpro - Input in HTML File](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhtml_input_abexa.html) — `abenhtml_input_abexa`
- [dynpro - HTML from the MIME Repository](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmime_html_abexa.html) — `abenmime_html_abexa`
- [dynpro - Images in HTML](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmime_pictures_abexa.html) — `abenmime_pictures_abexa`
- [dynpro - Step Loop](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensteploop_abexa.html) — `abensteploop_abexa`
- [dynpro - Tabstrips with Scrolling in SAP GUI](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentab_strip_control1_abexa.html) — `abentab_strip_control1_abexa`
- [dynpro - Tabstrips with Scrolling on the ABAP Server](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentab_strip_control2_abexa.html) — `abentab_strip_control2_abexa`
- [dynpro - Table Control with Scrolling](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_control1_abexa.html) — `abentable_control1_abexa`
- [dynpro - Table Control with Modifications](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_control2_abexa.html) — `abentable_control2_abexa`
- [dynpro - Text Output](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentext_output_abexa.html) — `abentext_output_abexa`

### SELECT  _(≈CH08/13, 34)_

- [SELECT, Union for Building a Ranges Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendemo_union_ranges_abexa.html) — `abendemo_union_ranges_abexa`
- [SELECT, Dynamic ORDER BY Clause](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynamic_order_by_abexa.html) — `abendynamic_order_by_abexa`
- [SELECT, Dynamic Token Specification](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendynamic_sql_abexa.html) — `abendynamic_sql_abexa`
- [SELECT, Grouping Function](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abengrouping_function_abexa.html) — `abengrouping_function_abexa`
- [SELECT, Hierarchy Navigator HIERARCHY_ANCESTORS_AGGREGATE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhier_ancs_agg_abexa.html) — `abenhier_ancs_agg_abexa`
- [SELECT, Hierarchy Navigator HIERARCHY_DESCENDANTS_AGGREGATE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhier_desc_agg_abexa.html) — `abenhier_desc_agg_abexa`
- [SELECT, Hierarchy Navigator HIERARCHY_DESCENDANTS_AGGREGATE with WITH](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhier_desc_agg_with_abexa.html) — `abenhier_desc_agg_with_abexa`
- [SELECT, Multiple Joins](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenjoin_joins_abexa.html) — `abenjoin_joins_abexa`
- [SELECT, Inner, Outer, and Cross Joins](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenjoins_abexa.html) — `abenjoins_abexa`
- [SELECT, Difference of Multiple Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_except_abexa.html) — `abenselect_except_abexa`
- [SELECT, Difference of CDS View Entity with Input Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_except_cds_para_abexa.html) — `abenselect_except_cds_para_abexa`
- [SELECT, Remove Columns from the SELECT List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_except_columns_abexa.html) — `abenselect_except_columns_abexa`
- [SELECT, Difference with Aggregate Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_except_min_abexa.html) — `abenselect_except_min_abexa`
- [SELECT, Difference with Global Temporary Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_except_min_gtt_abexa.html) — `abenselect_except_min_gtt_abexa`
- [SELECT, Internal Table as Data Source of a Query](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_from_itab_abexa.html) — `abenselect_from_itab_abexa`
- [SELECT, Internal Table as a Data Source of the Hierarchy Generator](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_from_itab_hiera_abexa.html) — `abenselect_from_itab_hiera_abexa`
- [SELECT, Multiple Internal Tables as Data Sources of a Query](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_from_itab_multi_abexa.html) — `abenselect_from_itab_multi_abexa`
- [SELECT, Grouping Sets](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_grouping_sets_abexa.html) — `abenselect_grouping_sets_abexa`
- [SELECT, Hierarchy Generator, BULK vs. INCREMENTAL](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_hierarchy_abexa.html) — `abenselect_hierarchy_abexa`
- [SELECT, Byte Field Indicators](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_ind_bitfield_abexa.html) — `abenselect_ind_bitfield_abexa`
- [SELECT, Inline Declarations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_inline_decl_abexa.html) — `abenselect_inline_decl_abexa`
- [SELECT, Intersection of CDS View Entity with Input Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_inter_cds_para_abexa.html) — `abenselect_inter_cds_para_abexa`
- [SELECT, Intersection of Multiple Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_intersect_abexa.html) — `abenselect_intersect_abexa`
- [SELECT, Intersection with Aggregate Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_intersect_max_abexa.html) — `abenselect_intersect_max_abexa`
- [SELECT, Intersection with Global Temporary Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_intersect_max_gtt_abexa.html) — `abenselect_intersect_max_gtt_abexa`
- [SELECT, Create Internal Table as Target Area](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_into_new_table_abexa.html) — `abenselect_into_new_table_abexa`
- [SELECT, Create Structure as Target Area](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_into_new_wa_abexa.html) — `abenselect_into_new_wa_abexa`
- [SELECT, Union of Multiple Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_union_abexa.html) — `abenselect_union_abexa`
- [SELECT, Union of CDS View Entity with Input Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_union_cds_para_abexa.html) — `abenselect_union_cds_para_abexa`
- [SELECT, Union with Aggregate Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_union_sum_abexa.html) — `abenselect_union_sum_abexa`
- [SELECT, Union with Global Temporary Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_union_sum_gtt_abexa.html) — `abenselect_union_sum_gtt_abexa`
- [SELECT, Restriction of the Rows in the Result Set](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_up_to_offset_abexa.html) — `abenselect_up_to_offset_abexa`
- [SELECT, SQL Expressions in the WHERE Condition](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_in_where_cond_abexa.html) — `abensql_expr_in_where_cond_abexa`
- [SELECT, GROUP BY for SQL Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_with_group_by_abexa.html) — `abensql_expr_with_group_by_abexa`

### ABAP EML  _(≈CH23, 26)_

- [ABAP EML - COMMIT ENTITIES BEGIN, END with CONVERT KEY OF](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencommit_entities_beginend_abexa.html) — `abencommit_entities_beginend_abexa`
- [ABAP EML - COMMIT ENTITIES, Short and Long Form](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencommit_entities_sh_lo_abexa.html) — `abencommit_entities_sh_lo_abexa`
- [ABAP EML - COMMIT ENTITIES IN SIMULATION MODE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencommit_entities_sim_mod_abexa.html) — `abencommit_entities_sim_mod_abexa`
- [ABAP EML - AUTHORITY-CHECK DISABLE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_auth_check_disable_abexa.html) — `abeneml_auth_check_disable_abexa`
- [ABAP EML - RAP Calculator](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_calculator_abexa.html) — `abeneml_calculator_abexa`
- [ABAP EML - COMMIT ENTITIES, Dynamic Form](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_commit_dyn_abexa.html) — `abeneml_commit_dyn_abexa`
- [ABAP EML - MODIFY, Variants](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_modify_alternatives_abexa.html) — `abeneml_modify_alternatives_abexa`
- [ABAP EML - MODIFY AUGMENTING ENTITY](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_modify_augmenting_abexa.html) — `abeneml_modify_augmenting_abexa`
- [ABAP EML - MODIFY, Nonstandard Operations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_modify_custom_op_abexa.html) — `abeneml_modify_custom_op_abexa`
- [ABAP EML - MODIFY, Standard Operations (Managed)](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_modify_op_abexa.html) — `abeneml_modify_op_abexa`
- [ABAP EML - MODIFY, Field Specification Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_modify_op_fields_abexa.html) — `abeneml_modify_op_fields_abexa`
- [ABAP EML - MODIFY, Standard Operations (Unmanaged)](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_modify_op_u_abexa.html) — `abeneml_modify_op_u_abexa`
- [ABAP EML - READ, Variants](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_read_alternatives_abexa.html) — `abeneml_read_alternatives_abexa`
- [ABAP EML - READ, Field Specification Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_read_op_fields_abexa.html) — `abeneml_read_op_fields_abexa`
- [ABAP EML - READ, Operation Executing Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_read_op_func_abexa.html) — `abeneml_read_op_func_abexa`
- [ABAP EML - TYPE RESPONSE FOR](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_responses_2_abexa.html) — `abeneml_responses_2_abexa`
- [ABAP EML - Responses](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_responses_abexa.html) — `abeneml_responses_abexa`
- [ABAP EML - Responses (Dynamic Forms of ABAP EML Statements)](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_responses_dyn_abexa.html) — `abeneml_responses_dyn_abexa`
- [ABAP EML - Variants of SET FLAGS](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_set_flags_abexa.html) — `abeneml_set_flags_abexa`
- [ABAP EML - Variants of SET NAMES](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_set_names_abexa.html) — `abeneml_set_names_abexa`
- [ABAP EML - CORRESPONDING, Type Mapping](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_type_mapping_abexa.html) — `abeneml_type_mapping_abexa`
- [ABAP EML - GET PERMISSIONS, Dynamic Form](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenget_perm_dyn_form_abexa.html) — `abenget_perm_dyn_form_abexa`
- [ABAP EML - GET PERMISSIONS, Short and Long Forms](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenget_perm_forms_abexa.html) — `abenget_perm_forms_abexa`
- [ABAP EML - GET PERMISSIONS, only_clause](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenget_perm_only_abexa.html) — `abenget_perm_only_abexa`
- [ABAP EML - TYPE REQUEST FOR in a Managed RAP BO with Additional Save](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_additional_save_abexa.html) — `abenrap_additional_save_abexa`
- [ABAP EML - TYPE REQUEST FOR in a Managed RAP BO with Unmanaged Save](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_managed_unm_save_abexa.html) — `abenrap_managed_unm_save_abexa`

### RAP  _(≈CH23, 19)_

- [RAP - Behavior Extension](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl__behavior_ext_abexa.html) — `abenbdl__behavior_ext_abexa`
- [RAP - Action](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_action1_abexa.html) — `abenbdl_action1_abexa`
- [RAP - Action with Input Parameter](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_action2_abexa.html) — `abenbdl_action2_abexa`
- [RAP - Factory Action](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_action3_abexa.html) — `abenbdl_action3_abexa`
- [RAP - Node Extension](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_assoc_ext_abexa.html) — `abenbdl_assoc_ext_abexa`
- [RAP - Operation Augmentation](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_augment_abexa.html) — `abenbdl_augment_abexa`
- [RAP - Global Authorization](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_authorization_abexa.html) — `abenbdl_authorization_abexa`
- [RAP - Extend Determine Action](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_det_action_ext_abexa.html) — `abenbdl_det_action_ext_abexa`
- [RAP - Determination](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_determination_abexa.html) — `abenbdl_determination_abexa`
- [RAP - Draft Action Activate](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_draft_action1_abexa.html) — `abenbdl_draft_action1_abexa`
- [RAP - Draft Actions Edit, Discard, Prepare](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_draft_action2_abexa.html) — `abenbdl_draft_action2_abexa`
- [RAP - RAP BO with DCL Access Control](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_draft_query_abexa.html) — `abenbdl_draft_query_abexa`
- [RAP - BDEF Projection Extension, Field Extension](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_entity_proj_ext_1_abexa.html) — `abenbdl_entity_proj_ext_1_abexa`
- [RAP - BDEF Projection Extension, Node Extension](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_entity_proj_ext_abexa.html) — `abenbdl_entity_proj_ext_abexa`
- [RAP - Field Extension](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_field_ext_abexa.html) — `abenbdl_field_ext_abexa`
- [RAP - function](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_function_abexa.html) — `abenbdl_function_abexa`
- [RAP - Reuse with Redefined Parameter](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_redef_param_abexa.html) — `abenbdl_redef_param_abexa`
- [RAP - RAP BO Extension Using Interface](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_using_interface_abexa.html) — `abenbdl_using_interface_abexa`
- [RAP - Validation](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbdl_validation_abexa.html) — `abenbdl_validation_abexa`

### iXML  _(≈—, 19)_

- [iXML - Access to Attributes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_attributes_abexa.html) — `abenixml_attributes_abexa`
- [iXML - Iterator for Attributes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_attributes_iterator_abexa.html) — `abenixml_attributes_iterator_abexa`
- [iXML - Downcasts](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_casting_abexa.html) — `abenixml_casting_abexa`
- [iXML - Access to Adjacent Subnodes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_child_nodes_abexa.html) — `abenixml_child_nodes_abexa`
- [iXML - Create Nodes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_crea_elem_abexa.html) — `abenixml_crea_elem_abexa`
- [iXML - Create Simple Elements](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_crea_simple_elem_abexa.html) — `abenixml_crea_simple_elem_abexa`
- [iXML - DOM Representation](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_dom_abexa.html) — `abenixml_dom_abexa`
- [iXML - Iterator Filters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_filter_iterator_abexa.html) — `abenixml_filter_iterator_abexa`
- [iXML - Modify XML Documents](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_modify_dom_abexa.html) — `abenixml_modify_dom_abexa`
- [iXML - Iterator for Element List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_name_list_iterator_abexa.html) — `abenixml_name_list_iterator_abexa`
- [iXML - Iterator for Nodes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_node_iterator_abexa.html) — `abenixml_node_iterator_abexa`
- [iXML - Access Using Node List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_node_list_abexa.html) — `abenixml_node_list_abexa`
- [iXML - Iterator for Node List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_node_list_iterator_abexa.html) — `abenixml_node_list_iterator_abexa`
- [iXML - Access Using Names](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_node_names_abexa.html) — `abenixml_node_names_abexa`
- [iXML - Token Parsers and Renderers, Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_parse_render_tk_tab_abexa.html) — `abenixml_parse_render_tk_tab_abexa`
- [iXML - Token Parsers and Renderers, Iterative](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_parse_render_token_abexa.html) — `abenixml_parse_render_token_abexa`
- [iXML - Parse to DOM](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_parsing_abexa.html) — `abenixml_parsing_abexa`
- [iXML - Rendering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_render_abexa.html) — `abenixml_render_abexa`
- [iXML - Sequential Parsing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenixml_sequential_parsing_abexa.html) — `abenixml_sequential_parsing_abexa`

### JSON  _(≈—, 16)_

- [JSON - asJSON in General](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_hello_json_abexa.html) — `abenabap_hello_json_abexa`
- [JSON - asJSON for Anonymous Data Objects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_asjson_dref_abexa.html) — `abenabap_json_asjson_dref_abexa`
- [JSON - asJSON for Elementary Object Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_asjson_elem_abexa.html) — `abenabap_json_asjson_elem_abexa`
- [JSON - asJSON for Object References](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_asjson_oref_abexa.html) — `abenabap_json_asjson_oref_abexa`
- [JSON - asJSON for Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_asjson_struc_abexa.html) — `abenabap_json_asjson_struc_abexa`
- [JSON - asJSON for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_asjson_table_abexa.html) — `abenabap_json_asjson_table_abexa`
- [JSON - asJSON for Additional XML Schema Data Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_asjson_xsd_abexa.html) — `abenabap_json_asjson_xsd_abexa`
- [JSON - Transforming Names](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_names_to_upper_abexa.html) — `abenabap_json_names_to_upper_abexa`
- [JSON - Parsing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_oo_reader_abexa.html) — `abenabap_json_oo_reader_abexa`
- [JSON - Transformation to HTML](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_to_html_abexa.html) — `abenabap_json_to_html_abexa`
- [JSON - Rendering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_token_writer_abexa.html) — `abenabap_json_token_writer_abexa`
- [JSON - Object Components in JSON-XML](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_json_xml_abexa.html) — `abenabap_json_xml_abexa`
- [JSON - Simple Transformation for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_st_json_table_abexa.html) — `abenabap_st_json_table_abexa`
- [JSON - Simple Transformation for Name Attributes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_st_json_table_attr_abexa.html) — `abenabap_st_json_table_attr_abexa`
- [JSON - Transformation of XML Data](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_xml_to_json_abexa.html) — `abenabap_xml_to_json_abexa`
- [JSON - Identity Transformation with JSON Writer as Target](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenjson_trafo_id_abexa.html) — `abenjson_trafo_id_abexa`

### Selection Screens  _(≈CH08/13, 15)_

- [Selection Screens - Dynamic Selections](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfree_selection_abexa.html) — `abenfree_selection_abexa`
- [Selection Screens - Block Processing and Radio Button Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_at_sel_on_abexa.html) — `abensel_screen_at_sel_on_abexa`
- [Selection Screens - Pushbuttons](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_button_abexa.html) — `abensel_screen_button_abexa`
- [Selection Screens - Calling Standalone Selection Screens](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_call_sel_scr_abexa.html) — `abensel_screen_call_sel_scr_abexa`
- [Selection Screens - Dynamic Dictionary Reference](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_dyn_dict_abexa.html) — `abensel_screen_dyn_dict_abexa`
- [Selection Screens - Field Help](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_f1_help_abexa.html) — `abensel_screen_f1_help_abexa`
- [Selection Screens - Input Help for Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_f4_help_abexa.html) — `abensel_screen_f4_help_abexa`
- [Selection Screens - Change Standard GUI Status](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_gui_status_abexa.html) — `abensel_screen_gui_status_abexa`
- [Selection Screens - Display Properties for Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_param_screen_abexa.html) — `abensel_screen_param_screen_abexa`
- [Selection Screens - Value Properties of Selection Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_param_value_abexa.html) — `abensel_screen_param_value_abexa`
- [Selection Screens - Basic Form of Selection Criteria](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_sel_opt_abexa.html) — `abensel_screen_sel_opt_abexa`
- [Selection Screens - Default Values for Selection Criteria](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_sel_opt_def_abexa.html) — `abensel_screen_sel_opt_def_abexa`
- [Selection Screens - Subscreens](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_subscreen_abexa.html) — `abensel_screen_subscreen_abexa`
- [Selection Screens - Tabstrips](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_tabstrip_abexa.html) — `abensel_screen_tabstrip_abexa`
- [Selection Screens - Traps and Pitfalls](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_traps_abexa.html) — `abensel_screen_traps_abexa`

### AMDP  _(≈CH33, 13)_

- [AMDP - Access to ABAP Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_abap_types_abexa.html) — `abenamdp_abap_types_abexa`
- [AMDP - Implementation of an SQLScript Procedure](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_abexa.html) — `abenamdp_abexa`
- [AMDP - Calling an SQLScript Procedure from AMDP](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_call_abexa.html) — `abenamdp_call_abexa`
- [AMDP - Calling an AMDP Procedure from SQLScript](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_call_amdp_abexa.html) — `abenamdp_call_amdp_abexa`
- [AMDP - SQLScript with Tabular CHANGING Parameter](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_changing_abexa.html) — `abenamdp_changing_abexa`
- [AMDP - Method with Specified Service Connection](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_connection_abexa.html) — `abenamdp_connection_abexa`
- [AMDP - Access to Database Schemas](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_db_schema_abexa.html) — `abenamdp_db_schema_abexa`
- [AMDP - AMDP Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_functions_abexa.html) — `abenamdp_functions_abexa`
- [AMDP - Graph Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_graph_abexa.html) — `abenamdp_graph_abexa`
- [AMDP - AMDP Methods in Interfaces and Superclasses](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_polymorphism_abexa.html) — `abenamdp_polymorphism_abexa`
- [AMDP - Comparison of SQLScript with ABAP SQL](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamdp_vs_abap_sql_abexa.html) — `abenamdp_vs_abap_sql_abexa`
- [AMDP - Filling a Mesh with SQLScript](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_amdp_abexa.html) — `abenmesh_amdp_abexa`
- [AMDP - Procedures and Functions in a Nutshell](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensheet_amdp_abexa.html) — `abensheet_amdp_abexa`

### Meshes  _(≈—, 13)_

- [Meshes - Table Builds Using Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_build_abexa.html) — `abenmesh_build_abexa`
- [Meshes - Deleting Multiple Lines in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_delete_abexa.html) — `abenmesh_delete_abexa`
- [Meshes - Deleting Single Lines in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_delete_table_abexa.html) — `abenmesh_delete_table_abexa`
- [Meshes - FOR Expressions for Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_for_abexa.html) — `abenmesh_for_abexa`
- [Meshes - Forward Associations in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_for_forward_abexa.html) — `abenmesh_for_forward_abexa`
- [Meshes - Inverse Associations in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_for_inverse_abexa.html) — `abenmesh_for_inverse_abexa`
- [Meshes - Reflexive Associations in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_for_reflex_sngl_abexa.html) — `abenmesh_for_reflex_sngl_abexa`
- [Meshes - Insertions in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_insert_abexa.html) — `abenmesh_insert_abexa`
- [Meshes - Loops Across Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_loops_abexa.html) — `abenmesh_loops_abexa`
- [Meshes - Changing Multiple Lines in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_modify_abexa.html) — `abenmesh_modify_abexa`
- [Meshes - Changing Single Lines in Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_modify_table_abexa.html) — `abenmesh_modify_table_abexa`
- [Meshes - Setting Mesh Associations for Mesh Paths](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_set_association_abexa.html) — `abenmesh_set_association_abexa`
- [Meshes - Mesh Path Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmesh_table_expressions_abexa.html) — `abenmesh_table_expressions_abexa`

### string_tmpl  _(≈CH04, 13)_

- [string_tmpl - Alignments and Padding](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_align_abexa.html) — `abenstring_template_align_abexa`
- [string_tmpl - Strings of Digits](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_alpha_abexa.html) — `abenstring_template_alpha_abexa`
- [string_tmpl - Case](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_case_abexa.html) — `abenstring_template_case_abexa`
- [string_tmpl - Control Characters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_ctrlchar_abexa.html) — `abenstring_template_ctrlchar_abexa`
- [string_tmpl - Date Formats](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_date_abexa.html) — `abenstring_template_date_abexa`
- [string_tmpl - Number Formats](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_number_abexa.html) — `abenstring_template_number_abexa`
- [string_tmpl - Sign](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_sign_abexa.html) — `abenstring_template_sign_abexa`
- [string_tmpl - Time Formats](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_time_abexa.html) — `abenstring_template_time_abexa`
- [string_tmpl - Time Zones](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_timezone_abexa.html) — `abenstring_template_timezone_abexa`
- [string_tmpl - Formatting Settings](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_user_abexa.html) — `abenstring_template_user_abexa`
- [string_tmpl - Time Stamp Formats](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_utc_abexa.html) — `abenstring_template_utc_abexa`
- [string_tmpl - Specified Length](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_width_abexa.html) — `abenstring_template_width_abexa`
- [string_tmpl - asXML Format](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_template_xsd_abexa.html) — `abenstring_template_xsd_abexa`

### sXML  _(≈—, 12)_

- [sXML - Transformation of Formats](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_format_trafos_abexa.html) — `abensxml_format_trafos_abexa`
- [sXML - Formats](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_formats_abexa.html) — `abensxml_formats_abexa`
- [sXML - Object-Oriented Parsing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_oo_parsing_abexa.html) — `abensxml_oo_parsing_abexa`
- [sXML - Object-Oriented Rendering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_oo_rendering_abexa.html) — `abensxml_oo_rendering_abexa`
- [sXML - Token-Based Parsing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_parsing_abexa.html) — `abensxml_parsing_abexa`
- [sXML - Methods for Token-Based Parsing.](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_parsing_methods_abexa.html) — `abensxml_parsing_methods_abexa`
- [sXML - Steps in Token-Based Parsing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_parsing_steps_abexa.html) — `abensxml_parsing_steps_abexa`
- [sXML - Modifying XML Data](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_reader_writer_abexa.html) — `abensxml_reader_writer_abexa`
- [sXML - Namespace Declarations in Token-Based Rendering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_renderering_ns_abexa.html) — `abensxml_renderering_ns_abexa`
- [sXML - Token-Based Rendering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_rendering_abexa.html) — `abensxml_rendering_abexa`
- [sXML - Deserialization with XML Reader](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_trafo_from_reader_abexa.html) — `abensxml_trafo_from_reader_abexa`
- [sXML - Transformation to XML Writer](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensxml_trafo_into_writer_abexa.html) — `abensxml_trafo_into_writer_abexa`

### ST  _(≈—, 10)_

- [ST - Method Call](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmethod_call_from_st_abexa.html) — `abenmethod_call_from_st_abexa`
- [ST - Option for Decimal Places](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_decimals_option_abexa.html) — `abenst_decimals_option_abexa`
- [ST - Formatting Options](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_format_option_abexa.html) — `abenst_format_option_abexa`
- [ST - Option for Invalid Values](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_noerror_option_abexa.html) — `abenst_noerror_option_abexa`
- [ST - Example of an ST Program](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_program_abexa.html) — `abenst_program_abexa`
- [ST - Option for Regime](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_regime_option_abexa.html) — `abenst_regime_option_abexa`
- [ST - Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_structure_abexa.html) — `abenst_structure_abexa`
- [ST - Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_table_abexa.html) — `abenst_table_abexa`
- [ST - tt:value](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_value_abexa.html) — `abenst_value_abexa`
- [ST - Mapping of XML Fragments](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenst_xsdany_abexa.html) — `abenst_xsdany_abexa`

### asXML  _(≈—, 10)_

- [asXML - Deserializing Structure Components](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_asxml_asjson_empty_abexa.html) — `abenabap_asxml_asjson_empty_abexa`
- [asXML - Mapping of UUIDs](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_xslt_mapping_abexa.html) — `abenabap_xslt_mapping_abexa`
- [asXML - Mapping of Anonymous Data Objects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_data_object_abexa.html) — `abenasxml_data_object_abexa`
- [asXML - Mapping of Elementary Data Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_elementary_abexa.html) — `abenasxml_elementary_abexa`
- [asXML - Mapping of XML Fragments](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_fragments_abexa.html) — `abenasxml_fragments_abexa`
- [asXML - Transformation ID vs. Simple Transformation](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_id_vs_st_abexa.html) — `abenasxml_id_vs_st_abexa`
- [asXML - Mapping of Objects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_object_abexa.html) — `abenasxml_object_abexa`
- [asXML - Mapping of Qualified Names](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_qnames_abexa.html) — `abenasxml_qnames_abexa`
- [asXML - Mapping of Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_structure_abexa.html) — `abenasxml_structure_abexa`
- [asXML - Mapping of Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenasxml_table_abexa.html) — `abenasxml_table_abexa`

### Lists  _(≈—, 9)_

- [Lists - Call from Dynpro Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenleave_to_list_proc_abexa.html) — `abenleave_to_list_proc_abexa`
- [Lists - Possible Colors](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_format_color2_abexa.html) — `abenlist_format_color2_abexa`
- [Lists - Using Colors](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_format_color_abexa.html) — `abenlist_format_color_abexa`
- [Lists - HIDE Technology](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_hide_abexa.html) — `abenlist_hide_abexa`
- [Lists - Line Elements](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_line_elements_abexa.html) — `abenlist_line_elements_abexa`
- [Lists - Page Layout](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_pages_abexa.html) — `abenlist_pages_abexa`
- [Lists - Page Header](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_top_of_page_abexa.html) — `abenlist_top_of_page_abexa`
- [Lists - Dialog Box](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlist_window_abexa.html) — `abenlist_window_abexa`
- [Lists - Spool](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenprint_list_abexa.html) — `abenprint_list_abexa`

### ABAP Objects  _(≈CH20, 8)_

- [ABAP Objects - Overview](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_objects_abexa.html) — `abenabap_objects_abexa`
- [ABAP Objects - Classes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenclass_abexa.html) — `abenclass_abexa`
- [ABAP Objects - Events in Inheritance](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenevent_inheritance_abexa.html) — `abenevent_inheritance_abexa`
- [ABAP Objects - Events](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenevents_abexa.html) — `abenevents_abexa`
- [ABAP Objects - Friendship](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfriends_abexa.html) — `abenfriends_abexa`
- [ABAP Objects - Inheritance](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninheritance_abexa.html) — `abeninheritance_abexa`
- [ABAP Objects - Interfaces](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninterface_abexa.html) — `abeninterface_abexa`
- [ABAP Objects - Object Transaction](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenoo_transaction_abexa.html) — `abenoo_transaction_abexa`

### Messages  _(≈CH15, 8)_

- [Messages - IF_T100_DYN_MSG in a Regular Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenif_t100_dyn_msg_abexa.html) — `abenif_t100_dyn_msg_abexa`
- [Messages - IF_T100_MESSAGE in a Regular Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenif_t100_message_abexa.html) — `abenif_t100_message_abexa`
- [Messages - IF_T100_MESSAGE in a Local Exception Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmessage_interface_abexa.html) — `abenmessage_interface_abexa`
- [Messages - IF_T100_MESSAGE in a Global Exception Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmessage_interface_global_abexa.html) — `abenmessage_interface_global_abexa`
- [Messages - IF_T100_MESSAGE for Exception with Message](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmessage_interface_reuse_abexa.html) — `abenmessage_interface_reuse_abexa`
- [Messages - IF_T100_DYN_MSG for Exception error_message](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenraise_error_message_abexa.html) — `abenraise_error_message_abexa`
- [Messages - IF_T100_DYN_MSG in a Local Exception Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenraise_message_abexa.html) — `abenraise_message_abexa`
- [Messages - IF_T100_DYN_MSG in a Global Exception Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenraise_message_global_abexa.html) — `abenraise_message_global_abexa`

### rel_exp  _(≈—, 8)_

- [rel_exp - Predicate Expression IS NOT BOUND](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbound_abexa.html) — `abenbound_abexa`
- [rel_exp - Comparison Operators for Character-Like Data Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencharacter_comparisons_abexa.html) — `abencharacter_comparisons_abexa`
- [rel_exp - Predicate Expression IS INSTANCE OF](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninstance_of_abexa.html) — `abeninstance_of_abexa`
- [rel_exp - Comparison with Selection Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlog_exp_in_abexa.html) — `abenlog_exp_in_abexa`
- [rel_exp - Comparison with Ranges Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlogexp_in_ranges_abexa.html) — `abenlogexp_in_ranges_abexa`
- [rel_exp - Predicate Function matches](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpred_function_matches_abexa.html) — `abenpred_function_matches_abexa`
- [rel_exp - Predicative Method Calls](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpredicative_method_call_abexa.html) — `abenpredicative_method_call_abexa`
- [rel_exp - Comparing Text Strings of Different Length](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_comparison_abexa.html) — `abenstring_comparison_abexa`

### sql_exp  _(≈—, 8)_

- [sql_exp - Aggregate Expressions in SQL Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_aggr_in_expr_abexa.html) — `abensql_expr_aggr_in_expr_abexa`
- [sql_exp - Arithmetic Calculations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_arith_abexa.html) — `abensql_expr_arith_abexa`
- [sql_exp - Simple CASE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_case_string_abexa.html) — `abensql_expr_case_string_abexa`
- [sql_exp - Cast Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_cast_abexa.html) — `abensql_expr_cast_abexa`
- [sql_exp - Constant in SELECT List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_literal_abexa.html) — `abensql_expr_literal_abexa`
- [sql_exp - Null Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_null_abexa.html) — `abensql_expr_null_abexa`
- [sql_exp - Complex CASE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_searched_case_abexa.html) — `abensql_expr_searched_case_abexa`
- [sql_exp - Concatenations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_string_abexa.html) — `abensql_expr_string_abexa`

### ADBC  _(≈CH33, 7)_

- [ADBC - DDL and DML](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_dml_ddl_abexa.html) — `abenadbc_dml_ddl_abexa`
- [ADBC - Parameter Binding](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_dml_ddl_binding_abexa.html) — `abenadbc_dml_ddl_binding_abexa`
- [ADBC - Bulk Access](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_dml_ddl_bulk_abexa.html) — `abenadbc_dml_ddl_bulk_abexa`
- [ADBC - Multiple Result Sets](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_multi_result_abexa.html) — `abenadbc_multi_result_abexa`
- [ADBC - Stored Procedure](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_procedure_abexa.html) — `abenadbc_procedure_abexa`
- [ADBC - Query](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_query_abexa.html) — `abenadbc_query_abexa`
- [ADBC - Prepared Statement](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenadbc_sql_prepared_abexa.html) — `abenadbc_sql_prepared_abexa`

### CDS DDL  _(≈CH22, 7)_

- [CDS DDL - DDIC-Based View, Joins of Associations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_assoc_join_v1_abexa.html) — `abencds_assoc_join_v1_abexa`
- [CDS DDL - CDS View Entity, Joins of CDS Associations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_assoc_join_v2_abexa.html) — `abencds_assoc_join_v2_abexa`
- [CDS DDL - DEFINE CUSTOM ENTITY, Implementing a Custom Query](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_custom_query_abexa.html) — `abencds_custom_query_abexa`
- [CDS DDL - DDIC-Based View, Exposing CDS Associations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_expose_assoc_v1_abexa.html) — `abencds_expose_assoc_v1_abexa`
- [CDS DDL - CDS View Entity, Exposing CDS Associations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_expose_assoc_v2_abexa.html) — `abencds_expose_assoc_v2_abexa`
- [CDS DDL - CDS Projection View, Expose Associations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_proj_view_assoc_abexa.html) — `abencds_proj_view_assoc_abexa`
- [CDS DDL - CDS Projection View, Calculating a Virtual Element](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_proj_view_virtel_abexa.html) — `abencds_proj_view_virtel_abexa`

### sql_win  _(≈—, 7)_

- [sql_win - Window Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_abexa.html) — `abensql_expr_over_abexa`
- [sql_win - Window Expressions without Partition](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_all_abexa.html) — `abensql_expr_over_all_abexa`
- [sql_win - Window Expressions with Grouping](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_group_abexa.html) — `abensql_expr_over_group_abexa`
- [sql_win - Window Functions LEAD and LAG](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_lead_lag_abexa.html) — `abensql_expr_over_lead_lag_abexa`
- [sql_win - Window Function NTILE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_ntile_abexa.html) — `abensql_expr_over_ntile_abexa`
- [sql_win - Window Expressions with Sort](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_order_by_abexa.html) — `abensql_expr_over_order_by_abexa`
- [sql_win - Window Frame Specification](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_over_win_frame_abexa.html) — `abensql_expr_over_win_frame_abexa`

### string_func  _(≈CH04, 7)_

- [string_func - cmax, cmin, and segment](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencmax_cmin_function_abexa.html) — `abencmax_cmin_function_abexa`
- [string_func - distance](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_function_distance_abexa.html) — `abenstring_function_distance_abexa`
- [string_func - escape for XSS](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_function_esc_xss_abexa.html) — `abenstring_function_esc_xss_abexa`
- [string_func - escape for HTML](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_function_escape_abexa.html) — `abenstring_function_escape_abexa`
- [string_func - count, find, and match](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_function_find_abexa.html) — `abenstring_function_find_abexa`
- [string_func - to_mixed and from_mixed](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_function_mixed_abexa.html) — `abenstring_function_mixed_abexa`
- [string_func - shift and substring](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_function_shift_abexa.html) — `abenstring_function_shift_abexa`

### ABAP SQL  _(≈CH08/13/19, 6)_

- [ABAP SQL - Locator, Copy Column](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendb_copy_abexa.html) — `abendb_copy_abexa`
- [ABAP SQL - Locator, Access to Column Content](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendb_locator_abexa.html) — `abendb_locator_abexa`
- [ABAP SQL - Reader Stream, Read Database Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendb_reader_abexa.html) — `abendb_reader_abexa`
- [ABAP SQL - Writer Stream, Fill Database Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendb_writer_abexa.html) — `abendb_writer_abexa`
- [ABAP SQL, Parameter Passing to a CDS View Entity](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_cds_para_abexa.html) — `abenselect_cds_para_abexa`
- [ABAP SQL - Working with Hierarchies](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensheet_abap_sql_hiera_abexa.html) — `abensheet_abap_sql_hiera_abexa`

### APC  _(≈—, 6)_

- [APC - AS ABAP as WebSocket Server](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenapc_abexa.html) — `abenapc_abexa`
- [APC - AS ABAP as Attached Client](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenapc_attached_client_abexa.html) — `abenapc_attached_client_abexa`
- [APC - System-Wide Access](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenapc_connect_via_handle_abexa.html) — `abenapc_connect_via_handle_abexa`
- [APC - Creating a Detached Client](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenapc_detached_client_abexa.html) — `abenapc_detached_client_abexa`
- [APC - AS ABAP as TCP Socket Client](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenapc_tcp_client_abexa.html) — `abenapc_tcp_client_abexa`
- [APC - AS ABAP as WebSocket Client](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenapc_ws_client_abexa.html) — `abenapc_ws_client_abexa`

### Component Operator  _(≈—, 6)_

- [Component Operator, Nested Mapping Rule](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_deep_mapp_abexa.html) — `abencorresponding_deep_mapp_abexa`
- [Component Operator, Handling Duplicates](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_duplicates_abexa.html) — `abencorresponding_duplicates_abexa`
- [Component Operator, Mapping Rule](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_mapping_abexa.html) — `abencorresponding_mapping_abexa`
- [Component Operator, Lookup Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_using_abexa.html) — `abencorresponding_using_abexa`
- [Component Operator, Reflexive Assignment](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_using_self_abexa.html) — `abencorresponding_using_self_abexa`
- [Component Operator, Comparison with FOR Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_vs_for_abexa.html) — `abencorresponding_vs_for_abexa`

### Field Symbols  _(≈—, 6)_

- [Field Symbols, Dynamic Structure Components](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenassign_component_abexa.html) — `abenassign_component_abexa`
- [Field Symbols, ASSIGN INCREMENT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenassign_increment_abexa.html) — `abenassign_increment_abexa`
- [Field Symbols, Casting](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencasting_imp_exp_abexa.html) — `abencasting_imp_exp_abexa`
- [Field Symbols, Casting Decimal Places](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencasting_obsolete_dec_abexa.html) — `abencasting_obsolete_dec_abexa`
- [Field Symbols, Casting Built-In Data Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencasting_obsolete_type_abexa.html) — `abencasting_obsolete_type_abexa`
- [Field Symbols, Cast Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfield_symbols_struc_abexa.html) — `abenfield_symbols_struc_abexa`

### RFC  _(≈CH30, 6)_

- [RFC - Parallel aRFC](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenparallel_rfc_abexa.html) — `abenparallel_rfc_abexa`
- [RFC - Dynamic Destination](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrfc_dynamic_dest_abexa.html) — `abenrfc_dynamic_dest_abexa`
- [RFC - Exception Handling](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrfc_exceptions_abexa.html) — `abenrfc_exceptions_abexa`
- [RFC - Implicit Logon Data](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrfc_logon_data_abexa.html) — `abenrfc_logon_data_abexa`
- [RFC - Dynamic Parameter Passing in sRFC](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrfc_parameter_tables_abexa.html) — `abenrfc_parameter_tables_abexa`
- [RFC - Parameter Passing in RFC](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrfc_parameters_abexa.html) — `abenrfc_parameters_abexa`

### SAP HANA  _(≈—, 6)_

- [SAP HANA, Database Procedure Proxy](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_db_procedure_abexa.html) — `abencall_db_procedure_abexa`
- [SAP HANA, Call Database Procedure](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_hana_db_proc_abexa.html) — `abencall_hana_db_proc_abexa`
- [SAP HANA, from ADBC to AMDP](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfrom_adbc_to_amdp_abexa.html) — `abenfrom_adbc_to_amdp_abexa`
- [SAP HANA, Cached Views](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhana_cached_views_abexa.html) — `abenhana_cached_views_abexa`
- [SAP HANA, ABAP-Specific Session Variables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhana_session_variables_abexa.html) — `abenhana_session_variables_abexa`
- [SAP HANA, Currency Conversion with SQLScript](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_script_curr_conv_abexa.html) — `abensql_script_curr_conv_abexa`

### WITH  _(≈—, 6)_

- [WITH, Aggregation for Join Set](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwith_agg_union_abexa.html) — `abenwith_agg_union_abexa`
- [WITH, Exposing Associations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwith_associations_abexa.html) — `abenwith_associations_abexa`
- [WITH, Exposing Associations with a Recursive Redirect](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwith_assocs_redir_self_abexa.html) — `abenwith_assocs_redir_self_abexa`
- [WITH, Exposing Associations with a Redirect](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwith_assocs_redirect_abexa.html) — `abenwith_assocs_redirect_abexa`
- [WITH, Client Handling](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwith_client_handling_abexa.html) — `abenwith_client_handling_abexa`
- [WITH, Common Table Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwith_cte_abexa.html) — `abenwith_cte_abexa`

### DDIC  _(≈CH03/07, 5)_

- [DDIC - Flagging of Deprecated Data in Check Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenddic_deprecation_abexa.html) — `abenddic_deprecation_abexa`
- [DDIC - Global Temporary Tables, Access](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenddic_gtt_abexa.html) — `abenddic_gtt_abexa`
- [DDIC - Replacement Object for Database Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenddic_replacement_object_abexa.html) — `abenddic_replacement_object_abexa`
- [DDIC - Built-In Dictionary Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenddic_types_abexa.html) — `abenddic_types_abexa`
- [DDIC - SQL Function UPPER](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_function_upper_abexa.html) — `abensql_function_upper_abexa`

### ICF  _(≈—, 5)_

- [ICF - Accessing the MIME Repository from a HTTP Service](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhttp_mime_pictures_abexa.html) — `abenhttp_mime_pictures_abexa`
- [ICF - ABAP as HTTP Client](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenicf_client_abexa.html) — `abenicf_client_abexa`
- [ICF - Accessing the MIME Repository Using ICF](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenicf_mime_pictures_abexa.html) — `abenicf_mime_pictures_abexa`
- [ICF - Calling an HTTP Service Using the POST Method](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenicf_post_service_abexa.html) — `abenicf_post_service_abexa`
- [ICF - Calling an HTTP Service](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenicf_service_abexa.html) — `abenicf_service_abexa`

### enum  _(≈—, 5)_

- [enum, Declaration](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenenum_declaration_abexa.html) — `abenenum_declaration_abexa`
- [enum, Type Description](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenenum_description_abexa.html) — `abenenum_description_abexa`
- [enum, Deserialization](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenenum_deserialization_abexa.html) — `abenenum_deserialization_abexa`
- [enum, Parameter Passing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenenum_formal_para_abexa.html) — `abenenum_formal_para_abexa`
- [enum, General Use](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenenum_usage_abexa.html) — `abenenum_usage_abexa`

### table_exp  _(≈—, 5)_

- [table_exp - Chainings](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_exp_chaining_abexa.html) — `abentable_exp_chaining_abexa`
- [table_exp - Default Value](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_exp_default_abexa.html) — `abentable_exp_default_abexa`
- [table_exp - Write Positions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_exp_itab_changing_abexa.html) — `abentable_exp_itab_changing_abexa`
- [table_exp - Line Specification](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_exp_itab_line_abexa.html) — `abentable_exp_itab_line_abexa`
- [table_exp - Side Effects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentable_exp_side_effect_abexa.html) — `abentable_exp_side_effect_abexa`

### ABAP CDS  _(≈CH22, 4)_

- [ABAP CDS, Annotation Array](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_annotation_array_abexa.html) — `abencds_annotation_array_abexa`
- [ABAP CDS, Evaluation of Annotations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_semantics_annotation_abexa.html) — `abencds_semantics_annotation_abexa`
- [ABAP CDS - Consuming Business Services with Demo Class](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconsume_bs_abexa.html) — `abenconsume_bs_abexa`
- [ABAP CDS - Consuming Business Services with OData Client Proxy](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconsume_bs_client_proxy_abexa.html) — `abenconsume_bs_client_proxy_abexa`

### Transaction Call  _(≈—, 4)_

- [Transaction Call, SPA/GPA Parameters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_transaction_abexa.html) — `abencall_transaction_abexa`
- [Transaction Call, BDC Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_transaction_bdc_abexa.html) — `abencall_transaction_bdc_abexa`
- [Transaction Call, Dialog Transaction](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_transaction_dialog_abexa.html) — `abencall_transaction_dialog_abexa`
- [Transaction Call, Report Transaction](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_transaction_repo_abexa.html) — `abencall_transaction_repo_abexa`

### num_func  _(≈—, 4)_

- [num_func - Integer Power Function ipow](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenipow_function_abexa.html) — `abenipow_function_abexa`
- [num_func - General Numeric Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmath_func_abexa.html) — `abenmath_func_abexa`
- [num_func - Extremum Functions nmax, nmin](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abennmax_nmin_function_abexa.html) — `abennmax_nmin_function_abexa`
- [num_func - Rounding Function round](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenround_function_abexa.html) — `abenround_function_abexa`

### regex  _(≈—, 4)_

- [regex - PCRE Regular Expression with Callouts](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpcre_callout_abexa.html) — `abenpcre_callout_abexa`
- [regex - Parsing with PCRE Regular Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpcre_parsing_abexa.html) — `abenpcre_parsing_abexa`
- [regex - Search for a Regular Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenregex_abexa.html) — `abenregex_abexa`
- [regex - XPath Regular Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenxpath_regex_abexa.html) — `abenxpath_regex_abexa`

### ABAP SQL Engine  _(≈CH08/13/19, 3)_

- [ABAP SQL Engine, Multiple Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_sql_engine_abexa.html) — `abenabap_sql_engine_abexa`
- [ABAP SQL Engine, Restriction to One Internal Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_sql_engine_itab_abexa.html) — `abenabap_sql_engine_itab_abexa`
- [ABAP SQL Engine, Restrictions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_sql_engine_restr_abexa.html) — `abenabap_sql_engine_restr_abexa`

### AMC  _(≈—, 3)_

- [AMC - Receiving Messages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamc_receive_abexa.html) — `abenamc_receive_abexa`
- [AMC - Sending Messages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamc_send_abexa.html) — `abenamc_send_abexa`
- [AMC - Suppressing Standalone Messages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenamc_suppress_echo_abexa.html) — `abenamc_suppress_echo_abexa`

### CDS TDL  _(≈CH22, 3)_

- [CDS TDL - CDS Enumerated Type, Use](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_enum_abexa.html) — `abencds_enum_abexa`
- [CDS TDL - CDS Enumerated Type, Type Description](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_enum_description_abexa.html) — `abencds_enum_description_abexa`
- [CDS TDL - Using a CDS Simple Type for Typing in ABAP](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_st_abexa.html) — `abencds_st_abexa`

### Exceptions  _(≈CH20, 3)_

- [Exceptions, CATCH](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencatch_exception_abexa.html) — `abencatch_exception_abexa`
- [Exceptions, RAISE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenraise_abexa.html) — `abenraise_abexa`
- [Exceptions, TRY](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentry_abexa.html) — `abentry_abexa`

### Expression-Orientation  _(≈—, 3)_

- [Expression-Orientation - 2048 Game](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abengame_2048_abexa.html) — `abengame_2048_abexa`
- [Expression-Orientation - Jawbreaker Game](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenjaw_breaker_abexa.html) — `abenjaw_breaker_abexa`
- [Expression-Orientation - Minesweeper Game](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmine_sweeper_abexa.html) — `abenmine_sweeper_abexa`

### Extracts  _(≈—, 3)_

- [Extracts, Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenextract_at_abexa.html) — `abenextract_at_abexa`
- [Extracts, Group Level Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenextract_group_abexa.html) — `abenextract_group_abexa`
- [Extracts, Determining Numbers and Totals](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenextract_sum_abexa.html) — `abenextract_sum_abexa`

### FILTER  _(≈—, 3)_

- [FILTER, Filter Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfilter_table_abexa.html) — `abenfilter_table_abexa`
- [FILTER, Filterings with Table Filter](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfilter_table_condition_abexa.html) — `abenfilter_table_condition_abexa`
- [FILTER, Single Values](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfilter_value_condition_abexa.html) — `abenfilter_value_condition_abexa`

### OS  _(≈—, 3)_

- [OS - Persistency Service](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenos_persist_abexa.html) — `abenos_persist_abexa`
- [OS - Query Service](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenos_query_abexa.html) — `abenos_query_abexa`
- [OS - Transaction Service](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenos_transaction_abexa.html) — `abenos_transaction_abexa`

### UPDATE  _(≈CH04, 3)_

- [UPDATE, USING CLIENT, CLIENTS](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenupdate_client_clients_abexa.html) — `abenupdate_client_clients_abexa`
- [UPDATE, Use of SET](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenupdate_set_abexa.html) — `abenupdate_set_abexa`
- [UPDATE, SET INDICATORS](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenupdate_set_indicators_abexa.html) — `abenupdate_set_indicators_abexa`

### VALUE  _(≈—, 3)_

- [VALUE, Operator for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvalue_itab_abexa.html) — `abenvalue_itab_abexa`
- [VALUE, Addition BASE for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvalue_itab_base_abexa.html) — `abenvalue_itab_base_abexa`
- [VALUE, Operator with LET for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvalue_itab_let_abexa.html) — `abenvalue_itab_let_abexa`

### arith_exp  _(≈—, 3)_

- [arith_exp - Lossless Calculations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencompute_exact_abexa.html) — `abencompute_exact_abexa`
- [arith_exp - Calculations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendivisions_abexa.html) — `abendivisions_abexa`
- [arith_exp - Floating Point Numbers](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenfloating_point_numbers_abexa.html) — `abenfloating_point_numbers_abexa`

### sql_agg  _(≈—, 3)_

- [sql_agg - Aggregate Function ALLOW_PRECISION_LOSS](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_aggr_prec_loss_abexa.html) — `abensql_expr_aggr_prec_loss_abexa`
- [sql_agg - Use in Aggregate Expressions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_in_aggregates_abexa.html) — `abensql_expr_in_aggregates_abexa`
- [sql_agg - Aggregate Function string_agg](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_string_agg_abexa.html) — `abensql_expr_string_agg_abexa`

### ADF  _(≈—, 2)_

- [ADF - Creating and Using an ABAP Daemon](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_daemon_abexa.html) — `abenabap_daemon_abexa`
- [ADF - Simple ABAP Daemon](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_mini_daemon_abexa.html) — `abenabap_mini_daemon_abexa`

### CDS DDIC-based views (obsolete)  _(≈CH22, 2)_

- [CDS DDIC-based views (obsolete), Client Handling](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_client_handl_v1_abexa.html) — `abencds_client_handl_v1_abexa`
- [CDS DDIC-based views (obsolete), Obsolete Client Handling](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_client_handling_obs_abexa.html) — `abencds_client_handling_obs_abexa`

### CL_ABAP_BIGINT  _(≈—, 2)_

- [CL_ABAP_BIGINT, Square Root Calculation](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbigint1_abexa.html) — `abenbigint1_abexa`
- [CL_ABAP_BIGINT, Key Encryption](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbigint_abexa.html) — `abenbigint_abexa`

### Conversion Operator  _(≈—, 2)_

- [Conversion Operator, Enumerated Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconv_enum_abexa.html) — `abenconv_enum_abexa`
- [Conversion Operator, Type Inference](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconv_type_inference_abexa.html) — `abenconv_type_inference_abexa`

### EXEC SQL  _(≈—, 2)_

- [EXEC SQL - Access to Database Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenexec_sql_db_function_abexa.html) — `abenexec_sql_db_function_abexa`
- [EXEC SQL - Use](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abennative_sql_abexa.html) — `abennative_sql_abexa`

### INSERT  _(≈—, 2)_

- [INSERT, CLIENT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninsert_client_abexa.html) — `abeninsert_client_abexa`
- [INSERT, FROM SELECT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninsert_from_select_abexa.html) — `abeninsert_from_select_abexa`

### LDB  _(≈—, 2)_

- [LDB - Calls Using a Function Module](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlogical_database_abexa.html) — `abenlogical_database_abexa`
- [LDB - Linkage with a Program](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreport_abexa.html) — `abenreport_abexa`

### Path Expressions  _(≈—, 2)_

- [Path Expressions, Use in the SELECT List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpath_expr_in_colspec_abexa.html) — `abenpath_expr_in_colspec_abexa`
- [Path Expressions, Use in the FROM Clause](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpath_expr_in_from_clause_abexa.html) — `abenpath_expr_in_from_clause_abexa`

### Program Calls  _(≈—, 2)_

- [Program Calls, Modifying the Basic List](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensubmit_list_abexa.html) — `abensubmit_list_abexa`
- [Program Calls, Filling the Selection Screen](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensubmit_selscreen_abexa.html) — `abensubmit_selscreen_abexa`

### SAP LUW  _(≈—, 2)_

- [SAP LUW, ON COMMIT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensap_luw_on_commit_abexa.html) — `abensap_luw_on_commit_abexa`
- [SAP LUW, UPDATE TASK](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensap_luw_update_task_abexa.html) — `abensap_luw_update_task_abexa`

### Shared Objects  _(≈CH20, 2)_

- [Shared Objects - Writing to and Reading from an Area](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenshared_objects2_abexa.html) — `abenshared_objects2_abexa`
- [Shared Objects - Example](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenshared_objects_abexa.html) — `abenshared_objects_abexa`

### sql_func  _(≈—, 2)_

- [sql_func - Coalesce Function](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_expr_coalesce_abexa.html) — `abensql_expr_coalesce_abexa`
- [sql_func - String Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_string_func_abexa.html) — `abensql_string_func_abexa`

### ABAP EML in Use: Managed RAP BO with External Numbering  _(≈CH23, 1)_

- [ABAP EML in Use: Managed RAP BO with External Numbering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensheet_rap_ext_num_m_abexa.html) — `abensheet_rap_ext_num_m_abexa`

### ABAP EML in Use: Unmanaged RAP BO with External Numbering  _(≈CH23, 1)_

- [ABAP EML in Use: Unmanaged RAP BO with External Numbering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensheet_rap_ext_num_u_abexa.html) — `abensheet_rap_ext_num_u_abexa`

### ABAP SQL Statements with the Addition MAPPING FROM ENTITY  _(≈CH08/13/19, 1)_

- [ABAP SQL Statements with the Addition MAPPING FROM ENTITY](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensql_mapping_from_entity_abexa.html) — `abensql_mapping_from_entity_abexa`

### Absolute Type Names  _(≈—, 1)_

- [Absolute Type Names, Executable Example](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabs_type_names_abexa.html) — `abenabs_type_names_abexa`

### Access to XML Using Class Libraries  _(≈—, 1)_

- [Access to XML Using Class Libraries](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenxml_access_abexa.html) — `abenxml_access_abexa`

### Adjusted Serialization and Deserialization  _(≈—, 1)_

- [Adjusted Serialization and Deserialization](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenserializable_object_abexa.html) — `abenserializable_object_abexa`

### BDEF Derived Type Components in the Context of Requesting Permissions  _(≈—, 1)_

- [BDEF Derived Type Components in the Context of Requesting Permissions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_misc_abexa.html) — `abenderived_types_misc_abexa`

### CL_ABAP_CORRESPONDING for Internal Tables  _(≈CH06, 1)_

- [CL_ABAP_CORRESPONDING for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_corr_itab_abexa.html) — `abencl_abap_corr_itab_abexa`

### CL_ABAP_CORRESPONDING for Nested Structures  _(≈CH05, 1)_

- [CL_ABAP_CORRESPONDING for Nested Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_corr_struc_abexa.html) — `abencl_abap_corr_struc_abexa`

### CL_ABAP_CORRESPONDING for Simple Structures  _(≈CH05, 1)_

- [CL_ABAP_CORRESPONDING for Simple Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_corr_dyn_abexa.html) — `abencl_abap_corr_dyn_abexa`

### CL_ABAP_CORRESPONDING for Tabular Components  _(≈—, 1)_

- [CL_ABAP_CORRESPONDING for Tabular Components](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_corr_deep_abexa.html) — `abencl_abap_corr_deep_abexa`

### CL_ABAP_CORRESPONDING with Lookup Table  _(≈—, 1)_

- [CL_ABAP_CORRESPONDING with Lookup Table](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_corr_lookup_abexa.html) — `abencl_abap_corr_lookup_abexa`

### CL_ABAP_TX and API Classifications  _(≈—, 1)_

- [CL_ABAP_TX and API Classifications](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_tx_abexa.html) — `abencl_abap_tx_abexa`

### CORRESPONDING Operator Using the Additions MAPPING and DEFAULT  _(≈—, 1)_

- [CORRESPONDING Operator Using the Additions MAPPING and DEFAULT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresp_mapping_default_abexa.html) — `abencorresp_mapping_default_abexa`

### Calling Function Modules  _(≈—, 1)_

- [Calling Function Modules](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_function_abexa.html) — `abencall_function_abexa`

### Calling a Dialog Module  _(≈—, 1)_

- [Calling a Dialog Module](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_dialog_abexa.html) — `abencall_dialog_abexa`

### Case Distinction CASE TYPE OF for Exceptions  _(≈CH20, 1)_

- [Case Distinction CASE TYPE OF for Exceptions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencase_type_of_exception_abexa.html) — `abencase_type_of_exception_abexa`

### Case Distinction CASE TYPE OF for RTTI  _(≈—, 1)_

- [Case Distinction CASE TYPE OF for RTTI](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencase_type_of_rtti_abexa.html) — `abencase_type_of_rtti_abexa`

### Checking RAP Transactional Phases  _(≈CH23, 1)_

- [Checking RAP Transactional Phases](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_cl_abap_behv_aux_ph_abexa.html) — `abenrap_cl_abap_behv_aux_ph_abexa`

### Checkpoints and Checkpoint Groups  _(≈—, 1)_

- [Checkpoints and Checkpoint Groups](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencheckpoint_abexa.html) — `abencheckpoint_abexa`

### Client-Dependent CDS Table Functions  _(≈CH22, 1)_

- [Client-Dependent CDS Table Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_func_client_dep_abexa.html) — `abencds_func_client_dep_abexa`

### Client-Independent CDS Table Functions  _(≈CH22, 1)_

- [Client-Independent CDS Table Functions](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencds_func_client_indep_abexa.html) — `abencds_func_client_indep_abexa`

### Comparing Internal Tables  _(≈CH06, 1)_

- [Comparing Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencompare_table_abexa.html) — `abencompare_table_abexa`

### Component Operator for Internal Tables  _(≈CH06, 1)_

- [Component Operator for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_itab_abexa.html) — `abencorresponding_itab_abexa`

### Component Operator for Structures  _(≈CH05, 1)_

- [Component Operator for Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_struct_abexa.html) — `abencorresponding_struct_abexa`

### Component Operator for Table Expression  _(≈—, 1)_

- [Component Operator for Table Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_table_exp_abexa.html) — `abencorresponding_table_exp_abexa`

### Conditional Operator  _(≈—, 1)_

- [Conditional Operator, Type Inference](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencond_type_inference_abexa.html) — `abencond_type_inference_abexa`

### Contexts  _(≈—, 1)_

- [Contexts - Message Handling](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencontext_message_abexa.html) — `abencontext_message_abexa`

### Conversion Costs  _(≈—, 1)_

- [Conversion Costs](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconversion_costs_abexa.html) — `abenconversion_costs_abexa`

### Conversion Rules for Structures  _(≈CH05, 1)_

- [Conversion Rules for Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendata_conv_str_abexa.html) — `abendata_conv_str_abexa`

### Conversion of Integer Numbers to Bytes  _(≈—, 1)_

- [Conversion of Integer Numbers to Bytes](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconversion_int_to_hex_abexa.html) — `abenconversion_int_to_hex_abexa`

### Convert Time Stamp in Time Stamp Field  _(≈CH04, 1)_

- [Convert Time Stamp in Time Stamp Field](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconvert_utc_abexa.html) — `abenconvert_utc_abexa`

### Convert Time Stamps in Packed Numbers  _(≈CH04, 1)_

- [Convert Time Stamps in Packed Numbers](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenconvert_time_stamp_abexa.html) — `abenconvert_time_stamp_abexa`

### Converting a Classic Exception to a Class-Based Exception  _(≈CH20, 1)_

- [Converting a Classic Exception to a Class-Based Exception](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenraise_message_glbl_shrt_abexa.html) — `abenraise_message_glbl_shrt_abexa`

### Converting the Exception error_message to a Class-Based Exception  _(≈CH20, 1)_

- [Converting the Exception error_message to a Class-Based Exception](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenraise_error_message_shrt_abexa.html) — `abenraise_error_message_shrt_abexa`

### Creating Data Objects with Implicit Type  _(≈CH20, 1)_

- [Creating Data Objects with Implicit Type](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_data_implicit_abexa.html) — `abencreate_data_implicit_abexa`

### Creating Elementary Data Objects  _(≈CH20, 1)_

- [Creating Elementary Data Objects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_simple_data_abexa.html) — `abencreate_simple_data_abexa`

### Creating Reference Variables  _(≈—, 1)_

- [Creating Reference Variables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_reference_abexa.html) — `abencreate_reference_abexa`

### Creating Structured Data Objects  _(≈CH20, 1)_

- [Creating Structured Data Objects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_structured_data_abexa.html) — `abencreate_structured_data_abexa`

### Creating Tables Using FOR and VALUE  _(≈—, 1)_

- [Creating Tables Using FOR and VALUE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencond_iteration_value_abexa.html) — `abencond_iteration_value_abexa`

### Creating Tabular Data Objects  _(≈CH20, 1)_

- [Creating Tabular Data Objects](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_tabular_data_abexa.html) — `abencreate_tabular_data_abexa`

### Creating Values with FOR and REDUCE  _(≈—, 1)_

- [Creating Values with FOR and REDUCE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencond_iteration_reduce_abexa.html) — `abencond_iteration_reduce_abexa`

### Creating a Data Object as a Shared Object  _(≈CH20, 1)_

- [Creating a Data Object as a Shared Object](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_shared_data_objct_abexa.html) — `abencreate_shared_data_objct_abexa`

### Creating a Matrix Using FOR and VALUE  _(≈—, 1)_

- [Creating a Matrix Using FOR and VALUE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencond_iteration_matrix_abexa.html) — `abencond_iteration_matrix_abexa`

### Creating a Structure Using RTTC  _(≈CH05, 1)_

- [Creating a Structure Using RTTC](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_data_via_rttc_abexa.html) — `abencreate_data_via_rttc_abexa`

### Creating an Instance of a Class as a Shared Object  _(≈CH20, 1)_

- [Creating an Instance of a Class as a Shared Object](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencreate_shared_object_abexa.html) — `abencreate_shared_object_abexa`

### Decimal Floating Point Numbers  _(≈—, 1)_

- [Decimal Floating Point Numbers, Formatting with STYLE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwrite_style_abexa.html) — `abenwrite_style_abexa`

### Declaration of a Nested Structure  _(≈CH05, 1)_

- [Declaration of a Nested Structure](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abennested_structure_abexa.html) — `abennested_structure_abexa`

### Declaration of a Simple Structure  _(≈CH05, 1)_

- [Declaration of a Simple Structure](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensimple_structure_abexa.html) — `abensimple_structure_abexa`

### Deep Data Objects  _(≈CH20, 1)_

- [Deep Data Objects, Memory Consumption](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmemory_usage_abexa.html) — `abenmemory_usage_abexa`

### Demonstrating the SAP LUW  _(≈—, 1)_

- [Demonstrating the SAP LUW](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensap_luw_bundl_tech_abexa.html) — `abensap_luw_bundl_tech_abexa`

### Deriving LOB Handle Structures  _(≈CH05, 1)_

- [Deriving LOB Handle Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentypes_lob_handle_abexa.html) — `abentypes_lob_handle_abexa`

### Deserializing Empty Elements  _(≈—, 1)_

- [Deserializing Empty Elements](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_deserl_empt_elem_abexa.html) — `abenabap_deserl_empt_elem_abexa`

### Deserializing Missing Elements  _(≈—, 1)_

- [Deserializing Missing Elements](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabap_deserl_no_elem_abexa.html) — `abenabap_deserl_no_elem_abexa`

### Determining Data Object Distances  _(≈CH20, 1)_

- [Determining Data Object Distances](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendescribe_distance_abexa.html) — `abendescribe_distance_abexa`

### Determining Data Types  _(≈—, 1)_

- [Determining Data Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrtti_data_type_abexa.html) — `abenrtti_data_type_abexa`

### Determining Elementary Data Types  _(≈—, 1)_

- [Determining Elementary Data Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendescribe_field_abexa.html) — `abendescribe_field_abexa`

### Determining Object Types  _(≈CH20, 1)_

- [Determining Object Types](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrtti_object_type_abexa.html) — `abenrtti_object_type_abexa`

### Display BDEF Derived Type Components  _(≈—, 1)_

- [Display BDEF Derived Type Components](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_display_derived_type_abexa.html) — `abeneml_display_derived_type_abexa`

### Evaluating Date Fields and Time Fields  _(≈CH04, 1)_

- [Evaluating Date Fields and Time Fields](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendate_time_abexa.html) — `abendate_time_abexa`

### Example for CL_ABAP_BEHAVIOR_SAVER_FAILED  _(≈—, 1)_

- [Example for CL_ABAP_BEHAVIOR_SAVER_FAILED](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_abap_beh_saver_failed_abexa.html) — `abencl_abap_beh_saver_failed_abexa`

### Example for Message-Related BDEF Derived Type Components  _(≈—, 1)_

- [Example for Message-Related BDEF Derived Type Components](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_reported_abexa.html) — `abenderived_types_reported_abexa`

### Example for RAP Handler Methods  _(≈CH23, 1)_

- [Example for RAP Handler Methods](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_handler_methods_abexa.html) — `abenrap_handler_methods_abexa`

### Example for RAP Saver Method map_messages  _(≈CH23, 1)_

- [Example for RAP Saver Method map_messages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabp_map_messages_abexa.html) — `abenabp_map_messages_abexa`

### Example for RAP Saver Methods  _(≈CH23, 1)_

- [Example for RAP Saver Methods](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabp_saver_class_abexa.html) — `abenabp_saver_class_abexa`

### Example for RAP Saver Methods (Late Numbering Scenario)  _(≈CH23, 1)_

- [Example for RAP Saver Methods (Late Numbering Scenario)](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenabp_saver_ln_abexa.html) — `abenabp_saver_ln_abexa`

### Example for save_modified in a Managed RAP BO with Additional Save  _(≈CH23, 1)_

- [Example for save_modified in a Managed RAP BO with Additional Save](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensave_modified_add_save_abexa.html) — `abensave_modified_add_save_abexa`

### Example for save_modified in a Managed RAP BO with Unmanaged Save  _(≈CH23, 1)_

- [Example for save_modified in a Managed RAP BO with Unmanaged Save](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensave_modified_unm_save_abexa.html) — `abensave_modified_unm_save_abexa`

### Filling a Structure  _(≈CH05, 1)_

- [Filling a Structure](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstructure_filling_abexa.html) — `abenstructure_filling_abexa`

### Find a PCRE Regular Expression  _(≈CH04, 1)_

- [Find a PCRE Regular Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenpcre_abexa.html) — `abenpcre_abexa`

### Generic Typing and Complete Typing  _(≈—, 1)_

- [Generic Typing and Complete Typing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentyping_abexa.html) — `abentyping_abexa`

### Getting BDEF Derived Type Information Using CL_ABAP_BEHVDESCR  _(≈—, 1)_

- [Getting BDEF Derived Type Information Using CL_ABAP_BEHVDESCR](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_type_info_abexa.html) — `abenrap_type_info_abexa`

### Getting RAP Context Information Using CL_ABAP_BEHV_AUX  _(≈CH23, 1)_

- [Getting RAP Context Information Using CL_ABAP_BEHV_AUX](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_cl_abap_behv_aux_abexa.html) — `abenrap_cl_abap_behv_aux_abexa`

### Group Level Processing  _(≈—, 1)_

- [Group Level Processing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenint_table_at_abexa.html) — `abenint_table_at_abexa`

### Group Level Processing for Unsorted Tables  _(≈—, 1)_

- [Group Level Processing for Unsorted Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenint_table_at_unsorted_abexa.html) — `abenint_table_at_unsorted_abexa`

### Group Level Processing with Nested Groups  _(≈—, 1)_

- [Group Level Processing with Nested Groups](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenint_table_sum_abexa.html) — `abenint_table_sum_abexa`

### Host Expressions  _(≈—, 1)_

- [Host Expressions, Use in the WHERE Condition](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenhost_expr_in_where_cond_abexa.html) — `abenhost_expr_in_where_cond_abexa`

### Instance Operator NEW on the Left  _(≈—, 1)_

- [Instance Operator NEW on the Left](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abennew_on_the_left_abexa.html) — `abennew_on_the_left_abexa`

### Inverse Reads on Internal Table without STEP  _(≈CH06, 1)_

- [Inverse Reads on Internal Table without STEP](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeninverse_itab_for_abexa.html) — `abeninverse_itab_for_abexa`

### LET Expression  _(≈—, 1)_

- [LET Expression](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenlet_abexa.html) — `abenlet_abexa`

### Local Consumption of RAP Business Events  _(≈CH23, 1)_

- [Local Consumption of RAP Business Events](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_events_local_consume_abexa.html) — `abenrap_events_local_consume_abexa`

### Lossless Assignment  _(≈—, 1)_

- [Lossless Assignment](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmove_exact_abexa.html) — `abenmove_exact_abexa`

### MODIFY  _(≈—, 1)_

- [MODIFY, FROM TABLE](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbulk_modify_abexa.html) — `abenbulk_modify_abexa`

### MOVE-CORRESPONDING for Internal Tables  _(≈CH06, 1)_

- [MOVE-CORRESPONDING for Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmove_corresponding_abexa.html) — `abenmove_corresponding_abexa`

### MOVE-CORRESPONDING for Structures  _(≈CH05, 1)_

- [MOVE-CORRESPONDING for Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmove_corresponding_struc_abexa.html) — `abenmove_corresponding_struc_abexa`

### Macros  _(≈—, 1)_

- [Macros](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmacro_abexa.html) — `abenmacro_abexa`

### Method Chaining  _(≈—, 1)_

- [Method Chaining](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenmethod_chaining_abexa.html) — `abenmethod_chaining_abexa`

### OPEN CURSOR  _(≈—, 1)_

- [OPEN CURSOR, Read Data Using Cursor](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenopen_cursor_abexa.html) — `abenopen_cursor_abexa`

### Offset/Length Specifications  _(≈—, 1)_

- [Offset/Length Specifications](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendata_process_fields_abexa.html) — `abendata_process_fields_abexa`

### Parameter Passing  _(≈—, 1)_

- [Parameter Passing](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenprocedure_param_abexa.html) — `abenprocedure_param_abexa`

### RAP Calculator: Managed  _(≈CH23, 1)_

- [RAP Calculator: Managed, Draft-Enabled RAP BO with Late Numbering](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensheet_rap_calc_dr_ln_m_abexa.html) — `abensheet_rap_calc_dr_ln_m_abexa`

### RAP Messages: Transition and State Messages  _(≈CH23, 1)_

- [RAP Messages: Transition and State Messages](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_messages_abexa.html) — `abenrap_messages_abexa`

### Read Time Stamp from String  _(≈CH04, 1)_

- [Read Time Stamp from String](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_utclong_read_abexa.html) — `abencl_utclong_read_abexa`

### Reduce Operator  _(≈—, 1)_

- [Reduce Operator, Type Inference](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreduce_type_inference_abexa.html) — `abenreduce_type_inference_abexa`

### Reflexive Component Assignments  _(≈—, 1)_

- [Reflexive Component Assignments](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenreflexive_corresponding_abexa.html) — `abenreflexive_corresponding_abexa`

### Rounding Time Stamps in Packed Numbers  _(≈CH04, 1)_

- [Rounding Time Stamps in Packed Numbers](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenround_time_stamp_abexa.html) — `abenround_time_stamp_abexa`

### Runtime Measurement of Database Reads  _(≈CH04, 1)_

- [Runtime Measurement of Database Reads](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenget_run_time_abexa.html) — `abenget_run_time_abexa`

### SAP Locks  _(≈CH25, 1)_

- [SAP Locks, Set and Release](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenenqueue_abexa.html) — `abenenqueue_abexa`

### SET ENTITIES  _(≈—, 1)_

- [SET ENTITIES](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_set_entities_abexa.html) — `abeneml_set_entities_abexa`

### Selection Screens -Pushbuttons in the Toolbar  _(≈CH08/13, 1)_

- [Selection Screens -Pushbuttons in the Toolbar](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselscreen_pb_bar_abexa.html) — `abenselscreen_pb_bar_abexa`

### Selection Screens -Subscreens  _(≈CH08/13, 1)_

- [Selection Screens -Subscreens](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_with_subscr_abexa.html) — `abensel_screen_with_subscr_abexa`

### Selection Screens -Tabstrips  _(≈CH08/13, 1)_

- [Selection Screens -Tabstrips](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensel_screen_with_tabstrip_abexa.html) — `abensel_screen_with_tabstrip_abexa`

### Serialization to Heap or Embedded  _(≈—, 1)_

- [Serialization to Heap or Embedded](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenserialize_ref_heap_embed_abexa.html) — `abenserialize_ref_heap_embed_abexa`

### Serializing Data References  _(≈—, 1)_

- [Serializing Data References](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenserialize_dref_abexa.html) — `abenserialize_dref_abexa`

### Setting the Text Environment  _(≈—, 1)_

- [Setting the Text Environment](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenset_locale_abexa.html) — `abenset_locale_abexa`

### Sorting Internal Tables  _(≈CH06, 1)_

- [Sorting Internal Tables](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensort_stable_abexa.html) — `abensort_stable_abexa`

### Sorting Internal Tables Alphabetically  _(≈CH06, 1)_

- [Sorting Internal Tables Alphabetically](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensort_text_abexa.html) — `abensort_text_abexa`

### Sorting Internal Tables Dynamically  _(≈CH06, 1)_

- [Sorting Internal Tables Dynamically](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensort_itab_exp_abexa.html) — `abensort_itab_exp_abexa`

### Sorting Internal Tables with Secondary Keys  _(≈CH06, 1)_

- [Sorting Internal Tables with Secondary Keys](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abensort_itab_sec_key_abexa.html) — `abensort_itab_sec_key_abexa`

### Structure from ABAP Dictionary  _(≈CH05, 1)_

- [Structure from ABAP Dictionary](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendictionary_structure_abexa.html) — `abendictionary_structure_abexa`

### Transactional Phases in a RAP Transaction  _(≈CH23, 1)_

- [Transactional Phases in a RAP Transaction](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenrap_luw_abexa.html) — `abenrap_luw_abexa`

### Transformation of XML Element Names  _(≈—, 1)_

- [Transformation of XML Element Names](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_trafo_upper_lower_abexa.html) — `abencall_trafo_upper_lower_abexa`

### Transformation of XML Syntax Characters  _(≈—, 1)_

- [Transformation of XML Syntax Characters](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_trafo_escaping_abexa.html) — `abencall_trafo_escaping_abexa`

### Uploading an Excel File  _(≈—, 1)_

- [Uploading an Excel File](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenexcel_to_itab_abexa.html) — `abenexcel_to_itab_abexa`

### Usage of CL_DEMO_OUTPUT  _(≈—, 1)_

- [Usage of CL_DEMO_OUTPUT](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencl_demo_output_abexa.html) — `abencl_demo_output_abexa`

### User Dialogs  _(≈—, 1)_

- [User Dialogs](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenscreen_abexa.html) — `abenscreen_abexa`

### Using %cid / %cid_ref  _(≈—, 1)_

- [Using %cid / %cid_ref](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_cid_cidref_abexa.html) — `abenderived_types_cid_cidref_abexa`

### Using %control  _(≈—, 1)_

- [Using %control](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_control_abexa.html) — `abenderived_types_control_abexa`

### Using %data / %target  _(≈—, 1)_

- [Using %data / %target](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_data_abexa.html) — `abenderived_types_data_abexa`

### Using %fail  _(≈—, 1)_

- [Using %fail](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_fail_abexa.html) — `abenderived_types_fail_abexa`

### Using %is_draft  _(≈—, 1)_

- [Using %is_draft](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_isdraft_abexa.html) — `abenderived_types_isdraft_abexa`

### Using %key  _(≈—, 1)_

- [Using %key](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_key_abexa.html) — `abenderived_types_key_abexa`

### Using %pid  _(≈—, 1)_

- [Using %pid](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_pid_abexa.html) — `abenderived_types_pid_abexa`

### Using %pre / %tmp / %pky  _(≈—, 1)_

- [Using %pre / %tmp / %pky](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_pre_tmp_abexa.html) — `abenderived_types_pre_tmp_abexa`

### Using %tky  _(≈—, 1)_

- [Using %tky](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_types_tky_abexa.html) — `abenderived_types_tky_abexa`

### Using TYPE TABLE/TYPE STRUCTURE FOR HIERARCHY  _(≈CH05, 1)_

- [Using TYPE TABLE/TYPE STRUCTURE FOR HIERARCHY](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenderived_type_hierarchy_abexa.html) — `abenderived_type_hierarchy_abexa`

### Using the Addition PRIVILEGED with an ABAP EML Statement  _(≈CH23, 1)_

- [Using the Addition PRIVILEGED with an ABAP EML Statement](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abeneml_privileged_abexa.html) — `abeneml_privileged_abexa`

### Value Operator  _(≈—, 1)_

- [Value Operator, Type Inference](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenvalue_type_inference_abexa.html) — `abenvalue_type_inference_abexa`

### Value Ranges of Packed Numbers  _(≈—, 1)_

- [Value Ranges of Packed Numbers](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abentype_p_value_range_abexa.html) — `abentype_p_value_range_abexa`

### Variants of MOVE-CORRESPONDING and the CORRESPONDING Operator Using Deep Structures  _(≈CH05, 1)_

- [Variants of MOVE-CORRESPONDING and the CORRESPONDING Operator Using Deep Structures](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencorresponding_variants_s_abexa.html) — `abencorresponding_variants_s_abexa`

### WRITE TO  _(≈—, 1)_

- [WRITE TO, Truncation Behavior](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenwrite_truncation_abexa.html) — `abenwrite_truncation_abexa`

### XML Sources of Transformations  _(≈—, 1)_

- [XML Sources of Transformations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_trafo_sources_abexa.html) — `abencall_trafo_sources_abexa`

### XML Targets of Transformations  _(≈—, 1)_

- [XML Targets of Transformations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abencall_trafo_results_abexa.html) — `abencall_trafo_results_abexa`

### XSL  _(≈—, 1)_

- [XSL - Identity Transformation to asXML Format](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenxslt_abexa.html) — `abenxslt_abexa`

### bit_exp  _(≈—, 1)_

- [bit_exp - Bit Operations](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abendata_bit_abexa.html) — `abendata_bit_abexa`

### bit_func  _(≈—, 1)_

- [bit_func - Setting Bits](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenbit_func_abexa.html) — `abenbit_func_abexa`

### sql_cond  _(≈—, 1)_

- [sql_cond - Subquery in WHERE Condition](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenselect_subquery_abexa.html) — `abenselect_subquery_abexa`

### string_exp  _(≈CH04, 1)_

- [string_exp - Concatenating Strings](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenstring_concatenation_abexa.html) — `abenstring_concatenation_abexa`

### table_func  _(≈—, 1)_

- [table_func - Index Function](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/abenline_index_abexa.html) — `abenline_index_abexa`
