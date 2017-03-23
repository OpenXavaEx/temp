//
//  BKIM_RNViewController.m
//  bkim_react_native
//
//  Created by u01 on 23/03/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "BKIM_RNViewController.h"
#import "BKIM_RN.h"

@interface BKIM_RNViewController ()

@end

@implementation BKIM_RNViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
  
    BKIM_RN *bkim = [[BKIM_RN alloc]init];
    if (nil == self.talk2PeerId){
      [bkim openBKIM:self.view :self.productName :self.isDebug :self.imServerUrl :self.hostServerUrl :self.peerId :self.token];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
